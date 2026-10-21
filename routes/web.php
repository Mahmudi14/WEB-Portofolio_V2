<?php

use App\Http\Controllers\Admin\AboutSectionController;
use App\Http\Controllers\Admin\AchievementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EducationController;
use App\Http\Controllers\Admin\ExperienceController;
use App\Http\Controllers\Admin\HeroSectionController;
use App\Http\Controllers\Admin\PersonalInformationController;
use App\Http\Controllers\Admin\ProjectCategoryController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ResearchController;
use App\Http\Controllers\Admin\SkillCategoryController;
use App\Http\Controllers\Admin\SkillItemController;
use App\Http\Controllers\Admin\SocialLinkController;
use App\Http\Controllers\LandingPageController;
use Illuminate\Support\Facades\Route;

// Website publik
Route::get('/', [
    LandingPageController::class,
    'index',
])->name('home');

// Seluruh halaman dan aksi admin harus login.
Route::middleware(['auth'])->group(function () {

    // Dashboard Laravel lama diarahkan ke admin premium.
    Route::redirect('/dashboard', '/admin')
        ->name('dashboard');

    Route::prefix('admin')
        ->name('admin.')
        ->group(function () {

            // Dashboard
            Route::get('/', [
                DashboardController::class,
                'index',
            ])->name('dashboard');

            // Informasi Pribadi
            Route::get('/profile', [
                PersonalInformationController::class,
                'edit',
            ])->name('profile.edit');

            Route::put('/profile', [
                PersonalInformationController::class,
                'update',
            ])->name('profile.update');

            // Hero
            Route::get('/hero', [
                HeroSectionController::class,
                'edit',
            ])->name('hero.edit');

            Route::put('/hero', [
                HeroSectionController::class,
                'update',
            ])->name('hero.update');

            // About
            Route::get('/about', [
                AboutSectionController::class,
                'edit',
            ])->name('about.edit');

            Route::put('/about', [
                AboutSectionController::class,
                'update',
            ])->name('about.update');

            // Media Sosial
            Route::get('/social-links', [
                SocialLinkController::class,
                'index',
            ])->name('social-links.index');

            Route::post('/social-links', [
                SocialLinkController::class,
                'store',
            ])->name('social-links.store');

            Route::put('/social-links/{socialLink}', [
                SocialLinkController::class,
                'update',
            ])->name('social-links.update');

            Route::delete('/social-links/{socialLink}', [
                SocialLinkController::class,
                'destroy',
            ])->name('social-links.destroy');

            // Simpan urutan drag-and-drop
            Route::put('/social-links/reorder', [
                SocialLinkController::class,
                'reorder',
            ])->name('social-links.reorder');

            // Halaman edit media sosial
            Route::get('/social-links/{socialLink}/edit', [
                SocialLinkController::class,
                'edit',
            ])->name('social-links.edit');

            // Halaman detail media sosial
            Route::get('/social-links/{socialLink}', [
                SocialLinkController::class,
                'show',
            ])->name('social-links.show');

            // Drag-and-drop urutan kategori
            Route::put('/skills/reorder', [
                SkillCategoryController::class,
                'reorder',
            ])->name('skills.reorder');

            // Halaman edit kategori
            Route::get('/skills/{skillCategory}/edit', [
                SkillCategoryController::class,
                'edit',
            ])->name('skills.edit');

            // Halaman detail kategori
            Route::get('/skills/{skillCategory}', [
                SkillCategoryController::class,
                'show',
            ])->name('skills.show');

            // Tambah banyak sub-keahlian sekaligus
            Route::post('/skills/{skillCategory}/items/bulk', [
                SkillItemController::class,
                'storeMany',
            ])->name('skills.items.bulk-store');

            // Drag-and-drop urutan sub-keahlian
            Route::put('/skills/{skillCategory}/items/reorder', [
                SkillItemController::class,
                'reorder',
            ])->name('skills.items.reorder');

            // Kategori Keahlian
            Route::get('/skills', [
                SkillCategoryController::class,
                'index',
            ])->name('skills.index');

            Route::post('/skills', [
                SkillCategoryController::class,
                'store',
            ])->name('skills.store');

            Route::put('/skills/{skillCategory}', [
                SkillCategoryController::class,
                'update',
            ])->name('skills.update');

            Route::delete('/skills/{skillCategory}', [
                SkillCategoryController::class,
                'destroy',
            ])->name('skills.destroy');

            // Item Keahlian
            Route::post(
                '/skills/{skillCategory}/items',
                [SkillItemController::class, 'store']
            )->name('skills.items.store');

            Route::put(
                '/skills/{skillCategory}/items/{skillItem}',
                [SkillItemController::class, 'update']
            )->name('skills.items.update');

            Route::delete(
                '/skills/{skillCategory}/items/{skillItem}',
                [SkillItemController::class, 'destroy']
            )->name('skills.items.destroy');


            Route::get(
                '/educations',
                [EducationController::class, 'index']
            )->name('educations.index');

            Route::post(
                '/educations',
                [EducationController::class, 'store']
            )->name('educations.store');

            Route::put(
                '/educations/{education}',
                [EducationController::class, 'update']
            )->name('educations.update');

            Route::delete(
                '/educations/{education}',
                [EducationController::class, 'destroy']
            )->name('educations.destroy');

            Route::get(
                '/educations/{education}/edit',
                [EducationController::class, 'edit']
            )->name('educations.edit');

            Route::get(
                '/educations/{education}',
                [EducationController::class, 'show']
            )->name('educations.show');


            Route::get(
                '/experiences',
                [ExperienceController::class, 'index']
            )->name('experiences.index');

            Route::post(
                '/experiences',
                [ExperienceController::class, 'store']
            )->name('experiences.store');

            Route::put(
                '/experiences/{experience}',
                [ExperienceController::class, 'update']
            )->name('experiences.update');

            Route::delete(
                '/experiences/{experience}',
                [ExperienceController::class, 'destroy']
            )->name('experiences.destroy');

            // Simpan urutan pengalaman
            Route::put(
                '/experiences/reorder',
                [ExperienceController::class, 'reorder']
            )->name('experiences.reorder');

            // Halaman detail pengalaman
            Route::get(
                '/experiences/{experience}',
                [ExperienceController::class, 'show']
            )->name('experiences.show');

            // Halaman edit pengalaman
            Route::get(
                '/experiences/{experience}/edit',
                [ExperienceController::class, 'edit']
            )->name('experiences.edit');


            Route::get(
                '/achievements',
                [AchievementController::class, 'index']
            )->name('achievements.index');

            Route::post(
                '/achievements',
                [AchievementController::class, 'store']
            )->name('achievements.store');

            Route::put(
                '/achievements/{achievement}',
                [AchievementController::class, 'update']
            )->name('achievements.update');

            Route::delete(
                '/achievements/{achievement}',
                [AchievementController::class, 'destroy']
            )->name('achievements.destroy');
            // Drag-and-drop urutan pencapaian
            Route::put('/achievements/reorder', [
                AchievementController::class,
                'reorder',
            ])->name('achievements.reorder');

            // Halaman edit pencapaian
            Route::get('/achievements/{achievement}/edit', [
                AchievementController::class,
                'edit',
            ])->name('achievements.edit');

            // Halaman detail pencapaian
            Route::get('/achievements/{achievement}', [
                AchievementController::class,
                'show',
            ])->name('achievements.show');


            /*
|--------------------------------------------------------------------------
| KATEGORI PROYEK
|--------------------------------------------------------------------------
*/

            Route::post(
                '/project-categories',
                [ProjectCategoryController::class, 'store']
            )->name('project-categories.store');

            Route::put(
                '/project-categories/{projectCategory}',
                [ProjectCategoryController::class, 'update']
            )->name('project-categories.update');

            Route::delete(
                '/project-categories/{projectCategory}',
                [ProjectCategoryController::class, 'destroy']
            )->name('project-categories.destroy');


            /*
|--------------------------------------------------------------------------
| PROYEK & GALERI
|--------------------------------------------------------------------------
*/

            Route::get(
                '/projects',
                [ProjectController::class, 'index']
            )->name('projects.index');

            Route::post(
                '/projects',
                [ProjectController::class, 'store']
            )->name('projects.store');

            Route::put(
                '/projects/{project}',
                [ProjectController::class, 'update']
            )->name('projects.update');

            Route::delete(
                '/projects/{project}',
                [ProjectController::class, 'destroy']
            )->name('projects.destroy');
            // Drag-and-drop urutan proyek
            Route::put('/projects/reorder', [
                ProjectController::class,
                'reorder',
            ])->name('projects.reorder');

            // Halaman edit proyek
            Route::get('/projects/{project}/edit', [
                ProjectController::class,
                'edit',
            ])->name('projects.edit');

            // Halaman detail proyek
            Route::get('/projects/{project}', [
                ProjectController::class,
                'show',
            ])->name('projects.show');


            /*
|--------------------------------------------------------------------------
| PENELITIAN
|--------------------------------------------------------------------------
*/

            Route::get(
                '/researches',
                [ResearchController::class, 'index']
            )->name('researches.index');

            Route::post(
                '/researches',
                [ResearchController::class, 'store']
            )->name('researches.store');

            Route::put(
                '/researches/{research}',
                [ResearchController::class, 'update']
            )->name('researches.update');

            Route::delete(
                '/researches/{research}',
                [ResearchController::class, 'destroy']
            )->name('researches.destroy');

            // Drag-and-drop urutan penelitian
            Route::put('/researches/reorder', [
                ResearchController::class,
                'reorder',
            ])->name('researches.reorder');

            // Halaman edit penelitian
            Route::get('/researches/{research}/edit', [
                ResearchController::class,
                'edit',
            ])->name('researches.edit');

            // Halaman detail penelitian
            Route::get('/researches/{research}', [
                ResearchController::class,
                'show',
            ])->name('researches.show');
        });
});

// Pengaturan akun tetap menggunakan route yang sudah ada.
require __DIR__ . '/settings.php';
