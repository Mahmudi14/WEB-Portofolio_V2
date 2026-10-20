<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveProjectCategoryRequest;
use App\Models\ProjectCategory;
use App\Services\ProjectService;
use Illuminate\Http\RedirectResponse;

class ProjectCategoryController extends Controller
{
    public function store(
        SaveProjectCategoryRequest $request,
        ProjectService $service
    ): RedirectResponse {
        $service->createCategory($request->validated());

        return to_route('admin.projects.index')
            ->with('success', 'Kategori proyek berhasil ditambahkan.');
    }

    public function update(
        SaveProjectCategoryRequest $request,
        ProjectCategory $projectCategory,
        ProjectService $service
    ): RedirectResponse {
        $service->updateCategory(
            $projectCategory,
            $request->validated()
        );

        return to_route('admin.projects.index')
            ->with('success', 'Kategori proyek berhasil diperbarui.');
    }

    public function destroy(
        ProjectCategory $projectCategory,
        ProjectService $service
    ): RedirectResponse {
        if (! $service->deleteCategory($projectCategory)) {
            return to_route('admin.projects.index')
                ->with(
                    'error',
                    'Kategori masih digunakan oleh proyek. Pindahkan atau hapus proyek terkait terlebih dahulu.'
                );
        }

        return to_route('admin.projects.index')
            ->with('success', 'Kategori proyek berhasil dihapus.');
    }
}
