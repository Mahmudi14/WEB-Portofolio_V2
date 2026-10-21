<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveExperienceRequest;
use App\Models\Experience;
use App\Services\ExperienceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    public function index(
        ExperienceService $service
    ): Response {
        return Inertia::render(
            'Admin/Experiences/Index',
            [
                'experiences' => $service->all()
                    ->map(fn (Experience $experience) =>
                        $this->serialize($experience)
                    )
                    ->values(),
            ]
        );
    }

    public function show(
        Experience $experience
    ): Response {
        return Inertia::render(
            'Admin/Experiences/Show',
            [
                'experience' => $this->serialize(
                    $experience
                ),
            ]
        );
    }

    public function edit(
        Experience $experience
    ): Response {
        return Inertia::render(
            'Admin/Experiences/Edit',
            [
                'experience' => $this->serialize(
                    $experience
                ),
            ]
        );
    }

    public function store(
        SaveExperienceRequest $request,
        ExperienceService $service
    ): RedirectResponse {
        $service->create(
            $request->safe()->except([
                'logo',
                'remove_logo',
            ]),
            $request->file('logo')
        );

        return to_route('admin.experiences.index')
            ->with(
                'success',
                'Pengalaman berhasil ditambahkan.'
            );
    }

    public function update(
        SaveExperienceRequest $request,
        Experience $experience,
        ExperienceService $service
    ): RedirectResponse {
        $service->update(
            $experience,
            $request->safe()->except(['logo']),
            $request->file('logo')
        );

        return to_route(
            'admin.experiences.show',
            $experience
        )->with(
            'success',
            'Pengalaman berhasil diperbarui.'
        );
    }

    public function destroy(
        Experience $experience,
        ExperienceService $service
    ): RedirectResponse {
        $service->delete($experience);

        return to_route('admin.experiences.index')
            ->with(
                'success',
                'Pengalaman berhasil dihapus.'
            );
    }

    public function reorder(
        Request $request,
        ExperienceService $service
    ): RedirectResponse {
        $data = $request->validate([
            'ids' => [
                'required',
                'array',
                'min:1',
            ],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:experiences,id',
            ],
        ]);

        $service->reorder($data['ids']);

        return to_route('admin.experiences.index')
            ->with(
                'success',
                'Urutan pengalaman berhasil disimpan.'
            );
    }

    private function serialize(
        Experience $experience
    ): array {
        return [
            'id' => $experience->id,
            'category' => $experience->category,
            'position' => $experience->position,
            'institution_name' =>
                $experience->institution_name,
            'description' => $experience->description,
            'start_year' => $experience->start_year,
            'end_year' => $experience->end_year,
            'is_current' => $experience->is_current,
            'sort_order' => $experience->sort_order,
            'logo_url' => $experience->logo_path
                ? Storage::disk('public')->url(
                    $experience->logo_path
                )
                : null,
        ];
    }
}