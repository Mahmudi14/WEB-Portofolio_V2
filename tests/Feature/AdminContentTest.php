<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_guest_cannot_access_admin(): void
    {
        $this->get('/admin/profile')
            ->assertRedirect(route('login'));

        $this->get('/admin/hero')
            ->assertRedirect(route('login'));

        $this->get('/admin/about')
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_open_content_pages(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/admin/profile')->assertOk();
        $this->get('/admin/hero')->assertOk();
        $this->get('/admin/about')->assertOk();
    }

    public function test_admin_can_update_hero(): void
    {
        $this->actingAs(User::factory()->create());

        $this->put('/admin/hero', [
            'headline' => 'Selamat Datang',
            'description' => 'Portofolio pribadi saya.',
        ])->assertRedirect('/admin/hero');

        $this->assertDatabaseHas('hero_sections', [
            'id' => 1,
            'headline' => 'Selamat Datang',
        ]);
    }

    public function test_hero_requires_headline(): void
    {
        $this->actingAs(User::factory()->create());

        $this->put('/admin/hero', [
            'headline' => '',
            'description' => 'Deskripsi valid.',
        ])->assertSessionHasErrors(['headline']);
    }

    public function test_admin_can_update_about(): void
    {
        $this->actingAs(User::factory()->create());

        $this->put('/admin/about', [
            'description' => 'Saya seorang pengembang web.',
        ])->assertRedirect('/admin/about');

        $this->assertDatabaseHas('about_sections', [
            'id' => 1,
            'description' => 'Saya seorang pengembang web.',
        ]);
    }

    public function test_admin_can_update_personal_information(): void
    {
        $this->actingAs(User::factory()->create());

        $this->put('/admin/profile', [
            'full_name' => 'Nama Lengkap',
            'display_name' => 'Nama Tampilan',
            'email' => 'publik@example.com',
            'whatsapp' => '081234567890',
        ])->assertRedirect('/admin/profile');

        $this->assertDatabaseHas('personal_information', [
            'id' => 1,
            'email' => 'publik@example.com',
            'whatsapp' => '6281234567890',
        ]);
    }

    public function test_updating_hero_does_not_create_duplicates(): void
    {
        $this->actingAs(User::factory()->create());

        for ($i = 1; $i <= 2; $i++) {
            $this->put('/admin/hero', [
                'headline' => "Headline {$i}",
                'description' => 'Deskripsi Hero',
            ])->assertRedirect('/admin/hero');
        }

        $this->assertDatabaseCount('hero_sections', 1);
    }
}
