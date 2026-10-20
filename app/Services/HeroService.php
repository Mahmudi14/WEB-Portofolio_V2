<?php

namespace App\Services;

use App\Models\HeroSection;

class HeroService
{
    private const SINGLETON_ID = 1;

    public function get(): ?HeroSection
    {
        return HeroSection::find(self::SINGLETON_ID);
    }

    public function update(array $data): HeroSection
    {
        $hero = $this->get() ?? new HeroSection();

        $hero->id = self::SINGLETON_ID;

        $hero->fill([
            'headline' => $data['headline'],
            'description' => $data['description'],
        ]);

        $hero->save();

        return $hero;
    }
}
