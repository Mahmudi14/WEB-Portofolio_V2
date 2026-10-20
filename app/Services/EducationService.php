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
            ->orderByDesc('start_year')
            ->orderByDesc('id')
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

    private function ensureOwned(
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
