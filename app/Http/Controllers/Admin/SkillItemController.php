<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSkillItemRequest;
use App\Models\SkillCategory;
use App\Models\SkillItem;
use App\Services\SkillService;
use Illuminate\Http\RedirectResponse;

class SkillItemController extends Controller
{
    public function store(
        SaveSkillItemRequest $request,
        SkillCategory $skillCategory,
        SkillService $service
    ): RedirectResponse {
        $service->createItem($skillCategory, $request->validated());

        return to_route('admin.skills.index')
            ->with('success', 'Sub-keahlian berhasil ditambahkan.');
    }

    public function update(
        SaveSkillItemRequest $request,
        SkillCategory $skillCategory,
        SkillItem $skillItem,
        SkillService $service
    ): RedirectResponse {
        abort_unless($skillItem->skill_category_id === $skillCategory->id, 404);

        $service->updateItem($skillItem, $request->validated());

        return to_route('admin.skills.index')
            ->with('success', 'Sub-keahlian berhasil diperbarui.');
    }

    public function destroy(
        SkillCategory $skillCategory,
        SkillItem $skillItem,
        SkillService $service
    ): RedirectResponse {
        abort_unless($skillItem->skill_category_id === $skillCategory->id, 404);

        $service->deleteItem($skillItem);

        return to_route('admin.skills.index')
            ->with('success', 'Sub-keahlian berhasil dihapus.');
    }
}
