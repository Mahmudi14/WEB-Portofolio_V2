<?php

namespace App\Services;

use App\Models\Research;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResearchService
{
    public function all(): Collection
    {
        return Research::query()
            ->orderBy('sort_order')
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $data): Research
    {
        return DB::transaction(function () use ($data) {
            // Serialize pembuatan dan pengurutan penelitian.
            DB::table('researches')
                ->orderBy('id')
                ->lockForUpdate()
                ->pluck('id');

            $nextOrder = (int) Research::query()
                ->max('sort_order') + 1;

            return Research::create([
                ...$this->payload($data),
                'sort_order' => $nextOrder,
            ]);
        });
    }

    public function update(
        Research $research,
        array $data
    ): Research {
        $research->update(
            $this->payload($data)
        );

        return $research->refresh();
    }

    public function delete(Research $research): void
    {
        $research->delete();
    }

    public function reorder(array $ids): void
    {
        DB::transaction(function () use ($ids) {
            $existing = Research::query()
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
                    'Daftar penelitian telah berubah. Muat ulang halaman.',
                ]);
            }

            foreach ($submitted as $index => $id) {
                Research::query()
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
            'title' => trim($data['title']),
            'summary' => trim($data['summary']),
            'year' => (int) $data['year'],
        ];
    }
}
