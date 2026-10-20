<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveEducationRequest;
use App\Models\Education;
use App\Services\EducationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EducationController extends Controller
{
    public function index(
        EducationService $service
    ): Response {
        return Inertia::render(
            'Admin/Educations/Index',
            [
                'educations' => $service->all(),
                'profileExists' =>
                    $service->profileExists(),
            ]
        );
    }

    public function store(
        SaveEducationRequest $request,
        EducationService $service
    ): RedirectResponse {
        $service->create(
            $request->validated()
        );

        return to_route('admin.educations.index')
            ->with(
                'success',
                'Pendidikan berhasil ditambahkan.'
            );
    }

    public function update(
        SaveEducationRequest $request,
        Education $education,
        EducationService $service
    ): RedirectResponse {
        $service->update(
            $education,
            $request->validated()
        );

        return to_route('admin.educations.index')
            ->with(
                'success',
                'Pendidikan berhasil diperbarui.'
            );
    }

    public function destroy(
        Education $education,
        EducationService $service
    ): RedirectResponse {
        $service->delete($education);

        return to_route('admin.educations.index')
            ->with(
                'success',
                'Pendidikan berhasil dihapus.'
            );
    }
}
