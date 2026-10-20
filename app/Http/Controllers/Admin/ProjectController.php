<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveProjectRequest;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(
        ProjectService $service
    ): Response {
        $projects = $service->projects()
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'project_category_id' =>
                    $project->project_category_id,
                'title' => $project->title,
                'description' => $project->description,
                'technologies' => $project->technologies,
                'sort_order' => $project->sort_order,
                'category' => [
                    'id' => $project->category->id,
                    'name' => $project->category->name,
                ],
                'images' => $project->images
                    ->map(fn ($image) => [
                        'id' => $image->id,
                        'sort_order' => $image->sort_order,
                        'url' => Storage::disk('public')
                            ->url($image->image_path),
                    ])
                    ->values(),
            ]);

        return Inertia::render(
            'Admin/Projects/Index',
            [
                'categories' => $service->categories(),
                'projects' => $projects,
            ]
        );
    }

    public function store(
        SaveProjectRequest $request,
        ProjectService $service
    ): RedirectResponse {
        $service->create(
            $request->safe()->except([
                'images',
                'existing_image_ids',
            ]),
            $request->file('images', [])
        );

        return to_route('admin.projects.index')
            ->with('success', 'Proyek berhasil ditambahkan.');
    }

    public function update(
        SaveProjectRequest $request,
        Project $project,
        ProjectService $service
    ): RedirectResponse {
        $service->update(
            $project,
            $request->safe()->except(['images']),
            $request->file('images', [])
        );

        return to_route('admin.projects.index')
            ->with('success', 'Proyek berhasil diperbarui.');
    }

    public function destroy(
        Project $project,
        ProjectService $service
    ): RedirectResponse {
        $service->delete($project);

        return to_route('admin.projects.index')
            ->with('success', 'Proyek beserta galerinya berhasil dihapus.');
    }
}
