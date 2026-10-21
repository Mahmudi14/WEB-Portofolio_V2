<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSkillItemRequest;
use App\Models\SkillCategory;
use App\Models\SkillItem;
use App\Services\SkillService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SkillItemController extends Controller
{
    public function store(
        SaveSkillItemRequest $request,
        SkillCategory $skillCategory,
        SkillService $service
    ): RedirectResponse {
        $service->createItem(
            $skillCategory,
            $request->validated()
        );

        return to_route('admin.skills.show', $skillCategory)
            ->with('success', 'Sub-keahlian berhasil ditambahkan.');
    }

    public function storeMany(
        Request $request,
        SkillCategory $skillCategory,
        SkillService $service
    ): RedirectResponse {
        $data = $request->validate([
            'items' => [
                'required',
                'array',
                'min:1',
                'max:50',
            ],
            'items.*.name' => [
                'required',
                'string',
                'max:120',
                'distinct:ignore_case',
                Rule::unique('skill_items', 'name')
                    ->where(
                        'skill_category_id',
                        $skillCategory->getKey()
                    ),
            ],
        ]);

        $service->createItems(
            $skillCategory,
            $data['items']
        );

        return to_route('admin.skills.show', $skillCategory)
            ->with(
                'success',
                count($data['items']) .
                ' sub-keahlian berhasil ditambahkan.'
            );
    }

    public function update(
        SaveSkillItemRequest $request,
        SkillCategory $skillCategory,
        SkillItem $skillItem,
        SkillService $service
    ): RedirectResponse {
        abort_unless(
            $skillItem->skill_category_id === $skillCategory->id,
            404
        );

        $service->updateItem(
            $skillItem,
            $request->validated()
        );

        return to_route('admin.skills.show', $skillCategory)
            ->with('success', 'Sub-keahlian berhasil diperbarui.');
    }

    public function destroy(
        SkillCategory $skillCategory,
        SkillItem $skillItem,
        SkillService $service
    ): RedirectResponse {
        abort_unless(
            $skillItem->skill_category_id === $skillCategory->id,
            404
        );

        $service->deleteItem($skillItem);

        return to_route('admin.skills.show', $skillCategory)
            ->with('success', 'Sub-keahlian berhasil dihapus.');
    }

    public function reorder(
        Request $request,
        SkillCategory $skillCategory,
        SkillService $service
    ): RedirectResponse {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('skill_items', 'id')
                    ->where(
                        'skill_category_id',
                        $skillCategory->getKey()
                    ),
            ],
        ]);

        $service->reorderItems(
            $skillCategory,
            $data['ids']
        );

        return to_route('admin.skills.show', $skillCategory)
            ->with(
                'success',
                'Urutan sub-keahlian berhasil disimpan.'
            );
    }
}