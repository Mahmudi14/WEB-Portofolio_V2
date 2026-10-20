<?php

namespace App\Services;

use App\Models\Experience;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class ExperienceService
{
    public function all(): Collection
    {
        return Experience::query()
            ->orderBy('sort_order')
            ->orderByDesc('start_year')
            ->orderByDesc('id')
            ->get();
    }

    public function create(
        array $data,
        ?UploadedFile $logo = null
    ): Experience {
        $newPath = $this->storeLogo($logo);

        try {
            $payload = $this->payload($data);

            if ($newPath !== null) {
                $payload['logo_path'] = $newPath;
            }

            return Experience::create($payload);
        } catch (Throwable $exception) {
            $this->deleteQuietly($newPath);

            throw $exception;
        }
    }

    public function update(
        Experience $experience,
        array $data,
        ?UploadedFile $logo = null
    ): Experience {
        $newPath = $this->storeLogo($logo);
        $oldPath = $experience->logo_path;

        try {
            $payload = $this->payload($data);

            if ($newPath !== null) {
                $payload['logo_path'] = $newPath;
            } elseif ($data['remove_logo'] ?? false) {
                $payload['logo_path'] = null;
            }

            $experience->update($payload);
        } catch (Throwable $exception) {
            $this->deleteQuietly($newPath);

            throw $exception;
        }

        if (
            $newPath !== null ||
            ($data['remove_logo'] ?? false)
        ) {
            $this->deleteQuietly($oldPath);
        }

        return $experience->refresh();
    }

    public function delete(
        Experience $experience
    ): void {
        $logoPath = $experience->logo_path;

        $experience->delete();

        $this->deleteQuietly($logoPath);
    }

    private function payload(array $data): array
    {
        $current = (bool) $data['is_current'];

        return [
            'category' => $data['category'],
            'position' => trim($data['position']),
            'institution_name' =>
                trim($data['institution_name']),
            'description' => trim($data['description']),
            'start_year' => (int) $data['start_year'],
            'end_year' => $current
                ? null
                : (
                    isset($data['end_year'])
                        ? (int) $data['end_year']
                        : null
                ),
            'is_current' => $current,
            'sort_order' => (int) $data['sort_order'],
        ];
    }

    private function storeLogo(
        ?UploadedFile $logo
    ): ?string {
        if ($logo === null) {
            return null;
        }

        $path = $logo->store('experiences', 'public');

        if ($path === false) {
            throw new RuntimeException(
                'Gagal mengunggah logo pengalaman.'
            );
        }

        return $path;
    }

    private function deleteQuietly(
        ?string $path
    ): void {
        if (! $path) {
            return;
        }

        try {
            if (! Storage::disk('public')->delete($path)) {
                Log::warning(
                    'Logo pengalaman gagal dihapus.',
                    ['path' => $path]
                );
            }
        } catch (Throwable $exception) {
            Log::warning(
                'Gagal membersihkan logo pengalaman.',
                [
                    'path' => $path,
                    'error' => $exception->getMessage(),
                ]
            );
        }
    }
}
