<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSkillCategoryRequest;
use App\Models\SkillCategory;
use App\Services\SkillService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkillCategoryController extends Controller
{
    public function index(SkillService $service): Response
    {
        return Inertia::render('Admin/Skills/Index', [
            'categories' => $service->allCategories(),
        ]);
    }

    public function show(SkillCategory $skillCategory): Response
    {
        return Inertia::render('Admin/Skills/Show', [
            'category' => $skillCategory->load('items'),
        ]);
    }

    public function edit(SkillCategory $skillCategory): Response
    {
        return Inertia::render('Admin/Skills/Edit', [
            'category' => $skillCategory,
        ]);
    }

    public function store(
        SaveSkillCategoryRequest $request,
        SkillService $service
    ): RedirectResponse {
        $service->createCategory($request->validated());

        return to_route('admin.skills.index')
            ->with(
                'success',
                'Kategori keahlian berhasil ditambahkan.'
            );
    }

    public function update(
        SaveSkillCategoryRequest $request,
        SkillCategory $skillCategory,
        SkillService $service
    ): RedirectResponse {
        $service->updateCategory(
            $skillCategory,
            $request->validated()
        );

        return to_route('admin.skills.show', $skillCategory)
            ->with(
                'success',
                'Kategori keahlian berhasil diperbarui.'
            );
    }

    public function destroy(
        SkillCategory $skillCategory,
        SkillService $service
    ): RedirectResponse {
        $service->deleteCategory($skillCategory);

        return to_route('admin.skills.index')
            ->with(
                'success',
                'Kategori dan sub-keahliannya berhasil dihapus.'
            );
    }

    public function reorder(
        Request $request,
        SkillService $service
    ): RedirectResponse {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:skill_categories,id',
            ],
        ]);

        $service->reorderCategories($data['ids']);

        return to_route('admin.skills.index')
            ->with(
                'success',
                'Urutan kategori berhasil disimpan.'
            );
    }
}