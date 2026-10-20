<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAboutSectionRequest;
use App\Services\AboutService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AboutSectionController extends Controller
{
    public function edit(AboutService $service): Response
    {
        $about = $service->get();

        return Inertia::render('Admin/Content/Edit', [
            'kind' => 'about',
            'values' => [
                'description' => $about?->description ?? '',
            ],
        ]);
    }

    public function update(
        UpdateAboutSectionRequest $request,
        AboutService $service
    ): RedirectResponse {
        $service->update($request->validated());

        return to_route('admin.about.edit')
            ->with(
                'success',
                'Deskripsi Tentang Saya berhasil diperbarui.'
            );
    }
}
