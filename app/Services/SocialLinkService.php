<?php

namespace App\Services;

use App\Models\SocialLink;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SocialLinkService
{
    public function all(): Collection
    {
        return SocialLink::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function create(array $data): SocialLink
    {
        return DB::transaction(function () use ($data) {
            // Data baru ditempatkan di posisi terakhir.
            $last = (int) SocialLink::query()
                ->max('sort_order');

            return SocialLink::create([
                ...$this->payload($data),
                'sort_order' => $last + 1,
            ]);
        });
    }

    public function update(
        SocialLink $link,
        array $data
    ): SocialLink {
        // Edit tidak mengubah posisi drag-and-drop.
        $link->update([
            ...$this->payload($data),
            'sort_order' => $link->sort_order,
        ]);

        return $link->refresh();
    }

    public function delete(SocialLink $link): void
    {
        $link->delete();
    }

    public function reorder(array $ids): void
    {
        DB::transaction(function () use ($ids) {
            $existing = SocialLink::query()
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
                    'Daftar media sosial telah berubah. Muat ulang halaman.',
                ]);
            }

            foreach ($submitted as $index => $id) {
                SocialLink::query()
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
            'platform' => trim($data['platform']),
            'name' => trim($data['name']),
            'url' => trim($data['url']),
            'sort_order' => (int) $data['sort_order'],
        ];
    }
}
