<?php

namespace App\Services;

use App\Models\Achievement;
use Illuminate\Database\Eloquent\Collection;

class AchievementService
{
    public function all(): Collection
    {
        return Achievement::query()
            ->orderBy('sort_order')
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $data): Achievement
    {
        return Achievement::create(
            $this->payload($data)
        );
    }

    public function update(
        Achievement $achievement,
        array $data
    ): Achievement {
        $achievement->update(
            $this->payload($data)
        );

        return $achievement->refresh();
    }

    public function delete(Achievement $achievement): void
    {
        $achievement->delete();
    }

    private function payload(array $data): array
    {
        return [
            'category' => $data['category'],

            'title' => trim($data['title']),

            'description' => filled(
                $data['description'] ?? null
            )
                ? trim($data['description'])
                : null,

            'year' => (int) $data['year'],

            'institution_name' => filled(
                $data['institution_name'] ?? null
            )
                ? trim($data['institution_name'])
                : null,

            'sort_order' => (int) $data['sort_order'],
        ];
    }
}
