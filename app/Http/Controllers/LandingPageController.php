<?php

namespace App\Http\Controllers;

use App\Models\AboutSection;
use App\Models\Achievement;
use App\Models\Education;
use App\Models\Experience;
use App\Models\HeroSection;
use App\Models\PersonalInformation;
use App\Models\Project;
use App\Models\Research;
use App\Models\SkillCategory;
use App\Models\SocialLink;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function index(): Response
    {
        $profile = PersonalInformation::find(1);
        $hero = HeroSection::find(1);
        $about = AboutSection::find(1);

        $researchQuery = Research::query();

        // Kompatibel dengan database yang sudah
        // atau belum memiliki kolom sort_order.
        if (Schema::hasColumn('researches', 'sort_order')) {
            $researchQuery->orderBy('sort_order');
        }

        return Inertia::render('welcome', [
            'profile' => [
                'full_name' => $profile?->full_name,
                'display_name' => $profile?->display_name,
                'email' => $profile?->email,
                'whatsapp' => $profile?->whatsapp,

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

            'hero' => [
                'headline' => $hero?->headline,
                'description' => $hero?->description,
            ],

            'about' => [
                'description' => $about?->description,
            ],

            'socials' => SocialLink::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get([
                    'id',
                    'platform',
                    'name',
                    'url',
                ]),

            'skills' => SkillCategory::query()
                ->with('items')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'description' => $category->description,
                    'items' => $category->items->map(
                        fn ($item) => [
                            'id' => $item->id,
                            'name' => $item->name,
                        ]
                    )->values(),
                ])->values(),

            'educations' => Education::query()
                ->where('personal_information_id', 1)
                ->orderByDesc('start_year')
                ->orderByDesc('id')
                ->get([
                    'id',
                    'level',
                    'institution_name',
                    'major',
                    'start_year',
                    'end_year',
                    'is_current',
                ]),

            'experiences' => Experience::query()
                ->orderBy('sort_order')
                ->orderByDesc('start_year')
                ->get()
                ->map(fn ($experience) => [
                    'id' => $experience->id,
                    'category' => $experience->category,
                    'position' => $experience->position,
                    'institution_name' =>
                        $experience->institution_name,
                    'description' =>
                        $experience->description,
                    'start_year' => $experience->start_year,
                    'end_year' => $experience->end_year,
                    'is_current' => $experience->is_current,

                    'logo_url' => $experience->logo_path
                        ? Storage::disk('public')->url(
                            $experience->logo_path
                        )
                        : null,
                ])->values(),

            'achievements' => Achievement::query()
                ->orderBy('sort_order')
                ->orderByDesc('year')
                ->get([
                    'id',
                    'category',
                    'title',
                    'description',
                    'year',
                    'institution_name',
                ]),

            'projects' => Project::query()
                ->with(['category', 'images'])
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->get()
                ->map(fn ($project) => [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'technologies' => $project->technologies,
                    'category' =>
                        $project->category?->name ?? 'Proyek',

                    'images' => $project->images->map(
                        fn ($image) => [
                            'id' => $image->id,
                            'url' => Storage::disk('public')
                                ->url($image->image_path),
                        ]
                    )->values(),
                ])->values(),

            'researches' => $researchQuery
                ->orderByDesc('year')
                ->orderByDesc('id')
                ->get([
                    'id',
                    'title',
                    'summary',
                    'year',
                ]),
        ]);
    }
}