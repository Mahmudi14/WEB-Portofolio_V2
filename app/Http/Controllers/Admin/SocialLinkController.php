<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveSocialLinkRequest;
use App\Models\SocialLink;
use App\Services\SocialLinkService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SocialLinkController extends Controller
{
    public function index(SocialLinkService $service): Response
    {
        return Inertia::render('Admin/SocialLinks/Index', [
            'links' => $service->all(),
        ]);
    }

    public function store(
        SaveSocialLinkRequest $request,
        SocialLinkService $service
    ): RedirectResponse {
        $service->create($request->validated());

        return to_route('admin.social-links.index')
            ->with('success', 'Media sosial berhasil ditambahkan.');
    }

    public function update(
        SaveSocialLinkRequest $request,
        SocialLink $socialLink,
        SocialLinkService $service
    ): RedirectResponse {
        $service->update($socialLink, $request->validated());

        return to_route('admin.social-links.index')
            ->with('success', 'Media sosial berhasil diperbarui.');
    }

    public function destroy(
        SocialLink $socialLink,
        SocialLinkService $service
    ): RedirectResponse {
        $service->delete($socialLink);

        return to_route('admin.social-links.index')
            ->with('success', 'Media sosial berhasil dihapus.');
    }
}
