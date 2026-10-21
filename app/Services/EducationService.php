<?php

namespace App\Services;

use App\Models\Education;
use App\Models\PersonalInformation;
use Illuminate\Database\Eloquent\Collection;

class EducationService
{
    private const PERSONAL_INFORMATION_ID = 1;

    public function all(): Collection
    {
        return Education::query()
            ->where(
                'personal_information_id',
                self::PERSONAL_INFORMATION_ID
            )
            ->orderByRaw("
            CASE level
                WHEN 'SD'  THEN 1
                WHEN 'SMP' THEN 2
                WHEN 'SMA' THEN 3
                WHEN 'D3'  THEN 4
                WHEN 'D4'  THEN 5
                WHEN 'S1'  THEN 5
                WHEN 'S2'  THEN 6
                WHEN 'S3'  THEN 7
                ELSE 99
            END ASC
        ")
            // Yang sudah selesai lebih dahulu.
            ->orderByRaw("
            CASE
                WHEN end_year IS NULL THEN 1
                ELSE 0
            END ASC
        ")
            // Jika jenjang sama, kelulusan terawal
            // mendapatkan urutan pertama.
            ->orderBy('end_year', 'asc')
            ->orderBy('start_year', 'asc')
            ->orderBy('id', 'asc')
            ->get();
    }

    public function profileExists(): bool
    {
        return PersonalInformation::query()
            ->whereKey(self::PERSONAL_INFORMATION_ID)
            ->exists();
    }

    public function create(array $data): Education
    {
        $profile = PersonalInformation::query()
            ->findOrFail(
                self::PERSONAL_INFORMATION_ID
            );

        return $profile->educations()->create(
            $this->payload($data)
        );
    }

    public function update(
        Education $education,
        array $data
    ): Education {
        $this->ensureOwned($education);

        $education->update(
            $this->payload($data)
        );

        return $education->refresh();
    }

    public function delete(Education $education): void
    {
        $this->ensureOwned($education);

        $education->delete();
    }

    public function ensureOwned(
        Education $education
    ): void {
        abort_unless(
            $education->personal_information_id ===
                self::PERSONAL_INFORMATION_ID,
            404
        );
    }

    private function payload(array $data): array
    {
        $isCurrent = (bool) $data['is_current'];

        return [
            'level' => $data['level'],

            'institution_name' => trim(
                $data['institution_name']
            ),

            'major' => filled($data['major'] ?? null)
                ? trim($data['major'])
                : null,

            'start_year' => (int) $data['start_year'],

            'end_year' => $isCurrent
                ? null
                : (
                    isset($data['end_year'])
                    ? (int) $data['end_year']
                    : null
                ),

            'is_current' => $isCurrent,
        ];
    }
}
