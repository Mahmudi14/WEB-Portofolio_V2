<?php

namespace App\Services;

use App\Models\PersonalInformation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class PersonalInformationService
{
    private const SINGLETON_ID = 1;

    public function get(): ?PersonalInformation
    {
        return PersonalInformation::find(self::SINGLETON_ID);
    }

    public function update(
        array $data,
        ?UploadedFile $photo = null,
        ?UploadedFile $logo = null
    ): PersonalInformation {
        $newPhotoPath = null;
        $newLogoPath = null;

        $oldPhotoPath = null;
        $oldLogoPath = null;

        try {
            // Simpan file baru menggunakan nama acak Laravel.
            if ($photo !== null) {
                $newPhotoPath = $photo->store(
                    'profiles',
                    'public'
                );

                if ($newPhotoPath === false) {
                    throw new RuntimeException(
                        'Gagal mengunggah foto profil.'
                    );
                }
            }

            if ($logo !== null) {
                $newLogoPath = $logo->store(
                    'branding',
                    'public'
                );

                if ($newLogoPath === false) {
                    throw new RuntimeException(
                        'Gagal mengunggah logo.'
                    );
                }
            }

            $profile = DB::transaction(function () use (
                $data,
                $newPhotoPath,
                $newLogoPath,
                &$oldPhotoPath,
                &$oldLogoPath
            ) {
                $profile = PersonalInformation::query()
                    ->whereKey(self::SINGLETON_ID)
                    ->lockForUpdate()
                    ->first();

                if ($profile === null) {
                    $profile = new PersonalInformation();
                    $profile->id = self::SINGLETON_ID;
                }

                $oldPhotoPath = $profile->profile_photo;
                $oldLogoPath = $profile->logo_path;

                $profile->fill([
                    'full_name' => $data['full_name'],
                    'display_name' => $data['display_name'],
                    'email' => $data['email'],
                    'whatsapp' => $data['whatsapp'] ?? null,
                ]);

                // Jika tidak ada upload baru,
                // gambar lama tetap digunakan.
                if ($newPhotoPath !== null) {
                    $profile->profile_photo = $newPhotoPath;
                }

                if ($newLogoPath !== null) {
                    $profile->logo_path = $newLogoPath;
                }

                $profile->save();

                return $profile;
            });

        } catch (Throwable $exception) {
            // Jika proses gagal, bersihkan file
            // yang baru diunggah.
            $this->deleteQuietly($newPhotoPath);
            $this->deleteQuietly($newLogoPath);

            throw $exception;
        }

        // Database sudah berhasil disimpan.
        // Foto/logo lama boleh dibersihkan.
        if ($newPhotoPath !== null) {
            $this->deleteQuietly($oldPhotoPath);
        }

        if ($newLogoPath !== null) {
            $this->deleteQuietly($oldLogoPath);
        }

        return $profile;
    }

    private function deleteQuietly(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }

        try {
            $deleted = Storage::disk('public')
                ->delete($path);

            if (! $deleted) {
                Log::warning(
                    'File branding belum berhasil dihapus.',
                    ['path' => $path]
                );
            }
        } catch (Throwable $exception) {
            Log::warning(
                'Gagal membersihkan file branding.',
                [
                    'path' => $path,
                    'error' => $exception->getMessage(),
                ]
            );
        }
    }
}
