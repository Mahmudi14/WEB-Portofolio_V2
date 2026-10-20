<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePersonalInformationRequest;
use App\Services\PersonalInformationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PersonalInformationController extends Controller
{
    public function edit(
        PersonalInformationService $service
    ): Response {
        $profile = $service->get();

        return Inertia::render('Admin/Content/Edit', [
            'kind' => 'profile',
            'values' => [
                'full_name' => $profile?->full_name ?? '',
                'display_name' => $profile?->display_name ?? '',
                'email' => $profile?->email ?? '',
                'whatsapp' => $profile?->whatsapp ?? '',

                'photo_url' => $profile?->profile_photo
                    ? Storage::disk('public')->url(
                        $profile->profile_photo
                    )
                    : null,

                'logo_url' => $profile?->logo_path
                    ? Storage::disk('public')->url(
                        $profile->logo_path
                    )
                    : null,
            ],
        ]);
    }

    public function update(
        UpdatePersonalInformationRequest $request,
        PersonalInformationService $service
    ): RedirectResponse {
        $service->update(
            $request->safe()->except(['photo', 'logo']),
            $request->file('photo'),
            $request->file('logo')
        );

        return to_route('admin.profile.edit')
            ->with(
                'success',
                'Informasi pribadi dan branding berhasil diperbarui.'
            );
    }
}
