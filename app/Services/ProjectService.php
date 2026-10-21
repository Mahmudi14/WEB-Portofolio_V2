<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class ProjectService
{
    // ======================================
    // CATEGORIES
    // ======================================

    public function categories(): Collection
    {
        return ProjectCategory::query()
            ->withCount('projects')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function createCategory(array $data): ProjectCategory
    {
        return ProjectCategory::create([
            'name' => trim($data['name']),
            'sort_order' => (int) $data['sort_order'],
        ]);
    }

    public function updateCategory(
        ProjectCategory $category,
        array $data
    ): ProjectCategory {
        $category->update([
            'name' => trim($data['name']),
            'sort_order' => (int) $data['sort_order'],
        ]);

        return $category->refresh();
    }

    public function deleteCategory(
        ProjectCategory $category
    ): bool {
        return DB::transaction(function () use ($category) {
            $locked = ProjectCategory::query()
                ->lockForUpdate()
                ->findOrFail($category->id);

            if ($locked->projects()->exists()) {
                return false;
            }

            $locked->delete();

            return true;
        });
    }

    // ======================================
    // PROJECTS
    // ======================================

    public function projects(): Collection
    {
        return Project::query()
            ->with(['category', 'images'])
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get();
    }

    public function create(
        array $data,
        array $images
    ): Project {
        $count = count($images);

        if ($count < 1 || $count > 5) {
            throw ValidationException::withMessages([
                'images' => 'Proyek wajib memiliki 1–5 gambar.',
            ]);
        }

        $paths = $this->uploadImages($images);

        try {
            return DB::transaction(function () use (
                $data,
                $paths
            ) {
                $payload = $this->projectPayload($data);

                $payload['sort_order'] =
                    (int) Project::query()->max('sort_order') + 1;

                $project = Project::create($payload);

                foreach ($paths as $index => $path) {
                    $project->images()->create([
                        'image_path' => $path,
                        'sort_order' => $index + 1,
                    ]);
                }

                return $project;
            });
        } catch (Throwable $exception) {
            $this->deleteFiles($paths);

            throw $exception;
        }
    }

    public function update(
        Project $project,
        array $data,
        array $newImages
    ): Project {
        $keptIds = array_map(
            'intval',
            $data['existing_image_ids'] ?? []
        );

        if (
            count($keptIds) !==
            count(array_unique($keptIds))
        ) {
            throw ValidationException::withMessages([
                'existing_image_ids' =>
                'Urutan gambar mengandung duplikasi.',
            ]);
        }

        $finalCount = count($keptIds) + count($newImages);

        if ($finalCount < 1 || $finalCount > 5) {
            throw ValidationException::withMessages([
                'images' =>
                'Jumlah akhir gambar harus 1–5.',
            ]);
        }

        $paths = $this->uploadImages($newImages);
        $removedPaths = [];

        try {
            DB::transaction(function () use (
                $project,
                $data,
                $keptIds,
                $paths,
                &$removedPaths
            ) {
                $locked = Project::query()
                    ->lockForUpdate()
                    ->findOrFail($project->id);

                $images = $locked->images()
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                // Pastikan gambar benar-benar milik proyek.
                foreach ($keptIds as $id) {
                    if (! $images->has($id)) {
                        throw ValidationException::withMessages([
                            'existing_image_ids' =>
                            'Terdapat gambar yang tidak valid.',
                        ]);
                    }
                }

                // Hapus record gambar yang dibuang.
                foreach ($images as $id => $image) {
                    if (! in_array($id, $keptIds, true)) {
                        $removedPaths[] = $image->image_path;
                        $image->delete();
                    }
                }

                // Posisi sementara menghindari konflik
                // UNIQUE(project_id, sort_order).
                foreach ($keptIds as $index => $id) {
                    $images[$id]->update([
                        'sort_order' => 101 + $index,
                    ]);
                }

                // Susun ulang gambar lama dari posisi 1.
                foreach ($keptIds as $index => $id) {
                    $images[$id]->update([
                        'sort_order' => $index + 1,
                    ]);
                }

                // Tambahkan gambar baru setelah gambar lama.
                $offset = count($keptIds);

                foreach ($paths as $index => $path) {
                    $locked->images()->create([
                        'image_path' => $path,
                        'sort_order' => $offset + $index + 1,
                    ]);
                }

                $payload = $this->projectPayload($data);

                // Posisi proyek hanya berubah melalui drag-and-drop.
                $payload['sort_order'] = $locked->sort_order;

                $locked->update($payload);
            });
        } catch (Throwable $exception) {
            $this->deleteFiles($paths);

            throw $exception;
        }

        // Hapus file lama hanya setelah database sukses.
        $this->deleteFiles($removedPaths);

        return $project->refresh();
    }

    public function delete(Project $project): void
    {
        $paths = DB::transaction(
            function () use ($project) {
                $locked = Project::query()
                    ->lockForUpdate()
                    ->findOrFail($project->id);

                $paths = $locked->images()
                    ->pluck('image_path')
                    ->all();

                // project_images memakai cascadeOnDelete.
                $locked->delete();

                return $paths;
            }
        );

        $this->deleteFiles($paths);
    }
    // ==========================================
    // DRAG AND DROP URUTAN PROYEK
    // ==========================================

    public function reorderProjects(array $ids): void
    {
        DB::transaction(function () use ($ids) {
            $existing = Project::query()
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn($id) => (int) $id)
                ->all();

            $submitted = array_map('intval', $ids);

            $sortedExisting = $existing;
            $sortedSubmitted = $submitted;

            sort($sortedExisting);
            sort($sortedSubmitted);

            if ($sortedExisting !== $sortedSubmitted) {
                throw ValidationException::withMessages([
                    'ids' =>
                    'Daftar proyek telah berubah. Muat ulang halaman.',
                ]);
            }

            foreach ($submitted as $index => $id) {
                Project::query()
                    ->whereKey($id)
                    ->update([
                        'sort_order' => $index + 1,
                    ]);
            }
        });
    }

    // ======================================
    // HELPERS
    // ======================================

    private function projectPayload(array $data): array
    {
        return [
            'project_category_id' =>
            (int) $data['project_category_id'],

            'title' => trim($data['title']),

            'description' => trim($data['description']),

            'technologies' => filled(
                $data['technologies'] ?? null
            )
                ? trim($data['technologies'])
                : null,

            'sort_order' => (int) $data['sort_order'],
        ];
    }

    /**
     * @param UploadedFile[] $images
     * @return string[]
     */
    private function uploadImages(array $images): array
    {
        $paths = [];

        try {
            foreach ($images as $image) {
                $path = $image->store(
                    'projects',
                    'public'
                );

                if ($path === false) {
                    throw new RuntimeException(
                        'Gagal mengunggah gambar proyek.'
                    );
                }

                $paths[] = $path;
            }
        } catch (Throwable $exception) {
            $this->deleteFiles($paths);

            throw $exception;
        }

        return $paths;
    }

    private function deleteFiles(array $paths): void
    {
        foreach ($paths as $path) {
            if (! $path) {
                continue;
            }

            try {
                if (! Storage::disk('public')->delete($path)) {
                    Log::warning(
                        'Gambar proyek tidak berhasil dihapus.',
                        ['path' => $path]
                    );
                }
            } catch (Throwable $exception) {
                Log::warning(
                    'Gagal membersihkan gambar proyek.',
                    [
                        'path' => $path,
                        'error' => $exception->getMessage(),
                    ]
                );
            }
        }
    }
}
