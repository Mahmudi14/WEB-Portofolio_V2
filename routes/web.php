<?php

use App\Http\Controllers\Admin\AboutSectionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HeroSectionController;
use App\Http\Controllers\Admin\PersonalInformationController;
use App\Http\Controllers\Admin\SocialLinkController;
use App\Http\Controllers\Admin\SkillCategoryController;
use App\Http\Controllers\Admin\SkillItemController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});


Route::middleware(['auth'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/', [DashboardController::class, 'index'])
            ->name('dashboard');


        Route::get(
            '/profile',
            [PersonalInformationController::class, 'edit']
        )->name('profile.edit');

        Route::put(
            '/profile',
            [PersonalInformationController::class, 'update']
        )->name('profile.update');

        Route::get(
            '/hero',
            [HeroSectionController::class, 'edit']
        )->name('hero.edit');

        Route::put(
            '/hero',
            [HeroSectionController::class, 'update']
        )->name('hero.update');

        Route::get(
            '/about',
            [AboutSectionController::class, 'edit']
        )->name('about.edit');

        Route::put(
            '/about',
            [AboutSectionController::class, 'update']
        )->name('about.update');
    });

Route::get('social-links', [SocialLinkController::class, 'index'])
    ->name('social-links.index');
Route::post('social-links', [SocialLinkController::class, 'store'])
    ->name('social-links.store');
Route::put('social-links/{socialLink}', [SocialLinkController::class, 'update'])
    ->name('social-links.update');
Route::delete('social-links/{socialLink}', [SocialLinkController::class, 'destroy'])
    ->name('social-links.destroy');

Route::get('skills', [SkillCategoryController::class, 'index'])
    ->name('skills.index');
Route::post('skills', [SkillCategoryController::class, 'store'])
    ->name('skills.store');
Route::put('skills/{skillCategory}', [SkillCategoryController::class, 'update'])
    ->name('skills.update');
Route::delete('skills/{skillCategory}', [SkillCategoryController::class, 'destroy'])
    ->name('skills.destroy');

Route::post('skills/{skillCategory}/items', [SkillItemController::class, 'store'])
    ->name('skills.items.store');
Route::put('skills/{skillCategory}/items/{skillItem}', [SkillItemController::class, 'update'])
    ->name('skills.items.update');
Route::delete('skills/{skillCategory}/items/{skillItem}', [SkillItemController::class, 'destroy'])
    ->name('skills.items.destroy');


require __DIR__ . '/settings.php';
