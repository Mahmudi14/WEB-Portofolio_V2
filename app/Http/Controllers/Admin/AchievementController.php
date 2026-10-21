<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveAchievementRequest;
use App\Models\Achievement;
use App\Services\AchievementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function index(
        AchievementService $service
    ): Response {
        return Inertia::render(
            'Admin/Achievements/Index',
            [
                'achievements' => $service->all(),
            ]
        );
    }

    public function show(
        Achievement $achievement
    ): Response {
        return Inertia::render(
            'Admin/Achievements/Show',
            [
                'achievement' => $achievement,
            ]
        );
    }

    public function edit(
        Achievement $achievement
    ): Response {
        return Inertia::render(
            'Admin/Achievements/Edit',
            [
                'achievement' => $achievement,
            ]
        );
    }

    public function store(
        SaveAchievementRequest $request,
        AchievementService $service
    ): RedirectResponse {
        $service->create($request->validated());

        return to_route('admin.achievements.index')
            ->with(
                'success',
                'Pencapaian berhasil ditambahkan.'
            );
    }

    public function update(
        SaveAchievementRequest $request,
        Achievement $achievement,
        AchievementService $service
    ): RedirectResponse {
        $service->update(
            $achievement,
            $request->validated()
        );

        return to_route(
            'admin.achievements.show',
            $achievement
        )->with(
            'success',
            'Pencapaian berhasil diperbarui.'
        );
    }

    public function destroy(
        Achievement $achievement,
        AchievementService $service
    ): RedirectResponse {
        $service->delete($achievement);

        return to_route('admin.achievements.index')
            ->with(
                'success',
                'Pencapaian berhasil dihapus.'
            );
    }

    public function reorder(
        Request $request,
        AchievementService $service
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
                'exists:achievements,id',
            ],
        ]);

        $service->reorder($data['ids']);

        return to_route('admin.achievements.index')
            ->with(
                'success',
                'Urutan pencapaian berhasil disimpan.'
            );
    }
}
