<?php

namespace App\Services;

use App\Models\SocialLink;
use Illuminate\Database\Eloquent\Collection;

class SocialLinkService
{
    public function all(): Collection
    {
        return SocialLink::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function create(array $data): SocialLink
    {
        return SocialLink::create($this->payload($data));
    }

    public function update(SocialLink $link, array $data): SocialLink
    {
        $link->update($this->payload($data));

        return $link->refresh();
    }

    public function delete(SocialLink $link): void
    {
        $link->delete();
    }

    private function payload(array $data): array
    {
        return [
            'platform' => trim($data['platform']),
            'name' => trim($data['name']),
            'url' => trim($data['url']),
            'sort_order' => (int) $data['sort_order'],
        ];
    }
}
