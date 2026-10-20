<?php

namespace App\Services;

use App\Models\SkillCategory;
use App\Models\SkillItem;
use Illuminate\Database\Eloquent\Collection;

class SkillService
{
    public function allCategories(): Collection
    {
        return SkillCategory::query()
            ->with(['items' => function ($query) {
                $query->orderBy('sort_order')->orderBy('id');
            }])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function createCategory(array $data): SkillCategory
    {
        return SkillCategory::create($this->categoryPayload($data));
    }

    public function updateCategory(SkillCategory $category, array $data): SkillCategory
    {
        $category->update($this->categoryPayload($data));

        return $category->refresh();
    }

    public function deleteCategory(SkillCategory $category): void
    {
        // Relasi skill_items memakai ON DELETE CASCADE sesuai skema v1.0.
        $category->delete();
    }

    public function createItem(SkillCategory $category, array $data): SkillItem
    {
        return $category->items()->create($this->itemPayload($data));
    }

    public function updateItem(SkillItem $item, array $data): SkillItem
    {
        $item->update($this->itemPayload($data));

        return $item->refresh();
    }

    public function deleteItem(SkillItem $item): void
    {
        $item->delete();
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
