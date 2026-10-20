<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveExperienceRequest;
use App\Models\Experience;
use App\Services\ExperienceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    public function index(
        ExperienceService $service
    ): Response {
        $experiences = $service->all()
            ->map(fn (Experience $experience) => [
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
            ]);

        return Inertia::render(
            'Admin/Experiences/Index',
            ['experiences' => $experiences]
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

        return to_route('admin.experiences.index')
            ->with(
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
}
