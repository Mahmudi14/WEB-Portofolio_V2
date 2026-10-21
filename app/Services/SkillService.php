<?php

namespace App\Services;

use App\Models\SkillCategory;
use App\Models\SkillItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SkillService
{
    public function allCategories(): Collection
    {
        return SkillCategory::query()
            ->with([
                'items' => fn ($query) =>
                    $query->orderBy('sort_order')->orderBy('id')
            ])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function createCategory(array $data): SkillCategory
    {
        return DB::transaction(function () use ($data) {
            $last = (int) SkillCategory::query()
                ->max('sort_order');

            $data['sort_order'] = $last + 1;

            return SkillCategory::create(
                $this->categoryPayload($data)
            );
        });
    }

    public function updateCategory(
        SkillCategory $category,
        array $data
    ): SkillCategory {
        $category->update(
            $this->categoryPayload($data)
        );

        return $category->refresh();
    }

    public function deleteCategory(
        SkillCategory $category
    ): void {
        $category->delete();
    }

    public function createItem(
        SkillCategory $category,
        array $data
    ): SkillItem {
        return DB::transaction(function () use ($category, $data) {
            SkillCategory::query()
                ->whereKey($category->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $data['sort_order'] =
                (int) $category->items()->max('sort_order') + 1;

            return $category->items()->create(
                $this->itemPayload($data)
            );
        });
    }

    public function createItems(
        SkillCategory $category,
        array $items
    ): void {
        DB::transaction(function () use ($category, $items) {
            SkillCategory::query()
                ->whereKey($category->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $next = (int) $category->items()
                ->max('sort_order');

            foreach ($items as $item) {
                $next++;

                $category->items()->create([
                    'name' => trim($item['name']),
                    'sort_order' => $next,
                ]);
            }
        });
    }

    public function updateItem(
        SkillItem $item,
        array $data
    ): SkillItem {
        $item->update(
            $this->itemPayload($data)
        );

        return $item->refresh();
    }

    public function deleteItem(SkillItem $item): void
    {
        $item->delete();
    }

    public function reorderCategories(array $ids): void
    {
        DB::transaction(function () use ($ids) {
            $current = SkillCategory::query()
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $this->ensureSameIds($current, $ids);

            foreach ($ids as $index => $id) {
                SkillCategory::query()
                    ->whereKey($id)
                    ->update([
                        'sort_order' => $index + 1
                    ]);
            }
        });
    }

    public function reorderItems(
        SkillCategory $category,
        array $ids
    ): void {
        DB::transaction(function () use ($category, $ids) {
            SkillCategory::query()
                ->whereKey($category->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $current = SkillItem::query()
                ->where(
                    'skill_category_id',
                    $category->getKey()
                )
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $this->ensureSameIds($current, $ids);

            foreach ($ids as $index => $id) {
                SkillItem::query()
                    ->where(
                        'skill_category_id',
                        $category->getKey()
                    )
                    ->whereKey($id)
                    ->update([
                        'sort_order' => $index + 1
                    ]);
            }
        });
    }

    private function ensureSameIds(
        array $current,
        array $submitted
    ): void {
        $submitted = array_map('intval', $submitted);

        sort($current);

        $comparison = $submitted;
        sort($comparison);

        if ($comparison !== $current) {
            throw ValidationException::withMessages([
                'ids' =>
                    'Daftar sudah berubah. Muat ulang halaman lalu coba kembali.',
            ]);
        }
    }

    private function categoryPayload(array $data): array
    {
        return [
            'name' => trim($data['name']),
            'description' => trim($data['description']),
            'sort_order' => (int) $data['sort_order'],
        ];
    }

    private function itemPayload(array $data): array
    {
        return [
            'name' => trim($data['name']),
            'sort_order' => (int) $data['sort_order'],
        ];
    }
}