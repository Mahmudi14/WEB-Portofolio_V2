<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSocialLinkRequest;
use App\Models\SocialLink;
use App\Services\SocialLinkService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialLinkController extends Controller
{
    public function index(
        SocialLinkService $service
    ): Response {
        return Inertia::render(
            'Admin/SocialLinks/Index',
            [
                'links' => $service->all(),
            ]
        );
    }

    public function show(
        SocialLink $socialLink
    ): Response {
        return Inertia::render(
            'Admin/SocialLinks/Show',
            [
                'link' => $socialLink,
            ]
        );
    }

    public function edit(
        SocialLink $socialLink
    ): Response {
        return Inertia::render(
            'Admin/SocialLinks/Edit',
            [
                'link' => $socialLink,
            ]
        );
    }

    public function store(
        SaveSocialLinkRequest $request,
        SocialLinkService $service
    ): RedirectResponse {
        $service->create($request->validated());

        return to_route('admin.social-links.index')
            ->with(
                'success',
                'Media sosial berhasil ditambahkan.'
            );
    }

    public function update(
        SaveSocialLinkRequest $request,
        SocialLink $socialLink,
        SocialLinkService $service
    ): RedirectResponse {
        $service->update(
            $socialLink,
            $request->validated()
        );

        return to_route(
            'admin.social-links.show',
            $socialLink
        )->with(
            'success',
            'Media sosial berhasil diperbarui.'
        );
    }

    public function destroy(
        SocialLink $socialLink,
        SocialLinkService $service
    ): RedirectResponse {
        $service->delete($socialLink);

        return to_route('admin.social-links.index')
            ->with(
                'success',
                'Media sosial berhasil dihapus.'
            );
    }

    public function reorder(
        Request $request,
        SocialLinkService $service
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
                'exists:social_links,id',
            ],
        ]);

        $service->reorder($data['ids']);

        return to_route('admin.social-links.index')
            ->with(
                'success',
                'Urutan media sosial berhasil disimpan.'
            );
    }
}