<?php

namespace App\Services;

use App\Models\AboutSection;

class AboutService
{
    private const SINGLETON_ID = 1;

    public function get(): ?AboutSection
    {
        return AboutSection::find(self::SINGLETON_ID);
    }

    public function update(array $data): AboutSection
    {
        $about = $this->get() ?? new AboutSection();

        $about->id = self::SINGLETON_ID;

        $about->description = $data['description'];

        $about->save();

        return $about;
    }
}
