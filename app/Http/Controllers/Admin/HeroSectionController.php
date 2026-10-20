<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateHeroSectionRequest;
use App\Services\HeroService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class HeroSectionController extends Controller
{
    public function edit(HeroService $service): Response
    {
        $hero = $service->get();

        return Inertia::render('Admin/Content/Edit', [
            'kind' => 'hero',
            'values' => [
                'headline' => $hero?->headline ?? '',
                'description' => $hero?->description ?? '',
            ],
        ]);
    }

    public function update(
        UpdateHeroSectionRequest $request,
        HeroService $service
    ): RedirectResponse {
        $service->update($request->validated());

        return to_route('admin.hero.edit')
            ->with('success', 'Konten Hero berhasil diperbarui.');
    }
}
