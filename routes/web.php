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
use Illuminate\Support\Facades\Route;

// Website publik
Route::inertia('/', 'welcome')->name('home');

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
        });
});

// Pengaturan akun tetap menggunakan route yang sudah ada.
require __DIR__ . '/settings.php';
