<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSkillCategoryRequest;
use App\Models\SkillCategory;
use App\Services\SkillService;
use Illuminate\Http\RedirectResponse;
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

    public function store(
        SaveSkillCategoryRequest $request,
        SkillService $service
    ): RedirectResponse {
        $service->createCategory($request->validated());

        return to_route('admin.skills.index')
            ->with('success', 'Kategori keahlian berhasil ditambahkan.');
    }

    public function update(
        SaveSkillCategoryRequest $request,
        SkillCategory $skillCategory,
        SkillService $service
    ): RedirectResponse {
        $service->updateCategory($skillCategory, $request->validated());

        return to_route('admin.skills.index')
            ->with('success', 'Kategori keahlian berhasil diperbarui.');
    }

    public function destroy(
        SkillCategory $skillCategory,
        SkillService $service
    ): RedirectResponse {
        $service->deleteCategory($skillCategory);

        return to_route('admin.skills.index')
            ->with('success', 'Kategori dan sub-keahliannya berhasil dihapus.');
    }
}
