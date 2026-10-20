<?php

namespace App\Services;

use App\Models\Research;
use Illuminate\Database\Eloquent\Collection;

class ResearchService
{
    public function all(): Collection
    {
        return Research::query()
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $data): Research
    {
        return Research::create(
            $this->payload($data)
        );
    }

    public function update(
        Research $research,
        array $data
    ): Research {
        $research->update(
            $this->payload($data)
        );

        return $research->refresh();
    }

    public function delete(Research $research): void
    {
        $research->delete();
    }

    private function payload(array $data): array
    {
        return [
            'title' => trim($data['title']),

            'summary' => trim($data['summary']),

            'year' => (int) $data['year'],
        ];
    }
}
