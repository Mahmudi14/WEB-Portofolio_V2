<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveAchievementRequest;
use App\Models\Achievement;
use App\Services\AchievementService;
use Illuminate\Http\RedirectResponse;
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

    public function store(
        SaveAchievementRequest $request,
        AchievementService $service
    ): RedirectResponse {
        $service->create(
            $request->validated()
        );

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

        return to_route('admin.achievements.index')
            ->with(
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
}
