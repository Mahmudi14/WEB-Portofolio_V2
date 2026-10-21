<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveResearchRequest;
use App\Models\Research;
use App\Services\ResearchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResearchController extends Controller
{
    public function index(
        ResearchService $service
    ): Response {
        return Inertia::render(
            'Admin/Researches/Index',
            [
                'researches' => $service->all(),
            ]
        );
    }

    public function show(
        Research $research
    ): Response {
        return Inertia::render(
            'Admin/Researches/Show',
            [
                'research' => $research,
            ]
        );
    }

    public function edit(
        Research $research
    ): Response {
        return Inertia::render(
            'Admin/Researches/Edit',
            [
                'research' => $research,
            ]
        );
    }

    public function store(
        SaveResearchRequest $request,
        ResearchService $service
    ): RedirectResponse {
        $service->create($request->validated());

        return to_route('admin.researches.index')
            ->with(
                'success',
                'Penelitian berhasil ditambahkan.'
            );
    }

    public function update(
        SaveResearchRequest $request,
        Research $research,
        ResearchService $service
    ): RedirectResponse {
        $service->update(
            $research,
            $request->validated()
        );

        return to_route(
            'admin.researches.show',
            $research
        )->with(
            'success',
            'Penelitian berhasil diperbarui.'
        );
    }

    public function destroy(
        Research $research,
        ResearchService $service
    ): RedirectResponse {
        $service->delete($research);

        return to_route('admin.researches.index')
            ->with(
                'success',
                'Penelitian berhasil dihapus.'
            );
    }

    public function reorder(
        Request $request,
        ResearchService $service
    ): RedirectResponse {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:researches,id',
            ],
        ]);

        $service->reorder($data['ids']);

        return to_route('admin.researches.index')
            ->with(
                'success',
                'Urutan penelitian berhasil disimpan.'
            );
    }
}
