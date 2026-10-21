<?php

namespace App\Services;

use App\Models\Achievement;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        return DB::transaction(function () use ($data) {
            // Tentukan urutan baru secara otomatis.
            $last = (int) Achievement::query()
                ->max('sort_order');

            $data['sort_order'] = $last + 1;

            return Achievement::create(
                $this->payload($data)
            );
        });
    }

    public function update(
        Achievement $achievement,
        array $data
    ): Achievement {
        // Urutan hanya boleh berubah melalui drag-and-drop.
        $data['sort_order'] = $achievement->sort_order;

        $achievement->update(
            $this->payload($data)
        );

        return $achievement->refresh();
    }

    public function delete(
        Achievement $achievement
    ): void {
        $achievement->delete();
    }

    public function reorder(array $ids): void
    {
        DB::transaction(function () use ($ids) {
            $existing = Achievement::query()
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn($id) => (int) $id)
                ->all();

            $submitted = array_map('intval', $ids);

            $sortedExisting = $existing;
            $sortedSubmitted = $submitted;

            sort($sortedExisting);
            sort($sortedSubmitted);

            if ($sortedExisting !== $sortedSubmitted) {
                throw ValidationException::withMessages([
                    'ids' =>
                    'Daftar pencapaian berubah. Muat ulang halaman sebelum mengurutkan.',
                ]);
            }

            foreach ($submitted as $index => $id) {
                Achievement::query()
                    ->whereKey($id)
                    ->update([
                        'sort_order' => $index + 1,
                    ]);
            }
        });
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
