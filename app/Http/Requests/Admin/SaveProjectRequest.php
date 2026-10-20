<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class SaveProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('technologies') === '') {
            $this->merge([
                'technologies' => null,
            ]);
        }
    }

    public function rules(): array
    {
        $isUpdate = $this->route('project') !== null;

        return [
            'project_category_id' => [
                'required',
                'integer',
                Rule::exists('project_categories', 'id'),
            ],

            'title' => [
                'required',
                'string',
                'max:200',
            ],

            'description' => [
                'required',
                'string',
                'max:10000',
            ],

            'technologies' => [
                'nullable',
                'string',
                'max:3000',
            ],

            'sort_order' => [
                'required',
                'integer',
                'min:0',
                'max:4294967295',
            ],

            'images' => [
                $isUpdate ? 'sometimes' : 'required',
                'array',
                ...($isUpdate ? [] : ['min:1']),
                'max:5',
            ],

            'images.*' => [
                'required',
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max('3mb'),
            ],

            'existing_image_ids' => [
                'sometimes',
                'array',
                'max:5',
            ],

            'existing_image_ids.*' => [
                'integer',
                'distinct',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'project_category_id.required' =>
                'Kategori proyek wajib dipilih.',

            'title.required' =>
                'Judul proyek wajib diisi.',

            'description.required' =>
                'Deskripsi proyek wajib diisi.',

            'images.required' =>
                'Minimal satu gambar proyek wajib diunggah.',

            'images.max' =>
                'Maksimal lima gambar per proyek.',

            'images.*.max' =>
                'Ukuran setiap gambar maksimal 3 MB.',
        ];
    }
}
