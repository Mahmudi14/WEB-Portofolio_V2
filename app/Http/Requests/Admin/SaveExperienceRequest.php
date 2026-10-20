<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class SaveExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->boolean('is_current')) {
            $this->merge(['end_year' => null]);
        }
    }

    public function rules(): array
    {
        $year = (int) now()->year;

        return [
            'category' => [
                'required',
                Rule::in(['pekerjaan', 'organisasi']),
            ],

            'position' => [
                'required',
                'string',
                'max:150',
            ],

            'institution_name' => [
                'required',
                'string',
                'max:200',
            ],

            'description' => [
                'required',
                'string',
                'max:10000',
            ],

            'start_year' => [
                'required',
                'integer',
                'between:1900,'.$year,
            ],

            'end_year' => [
                'nullable',
                'integer',
                'gte:start_year',
                'max:'.$year,
            ],

            'is_current' => [
                'required',
                'boolean',
            ],

            'sort_order' => [
                'required',
                'integer',
                'min:0',
                'max:4294967295',
            ],

            'logo' => [
                'nullable',
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max('2mb'),
            ],

            'remove_logo' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'category.required' =>
                'Kategori pengalaman wajib dipilih.',
            'category.in' =>
                'Kategori hanya boleh Pekerjaan atau Organisasi.',
            'position.required' =>
                'Jabatan atau posisi wajib diisi.',
            'institution_name.required' =>
                'Nama perusahaan atau organisasi wajib diisi.',
            'description.required' =>
                'Deskripsi pengalaman wajib diisi.',
            'start_year.required' =>
                'Tahun mulai wajib diisi.',
            'start_year.between' =>
                'Tahun mulai tidak valid.',
            'end_year.gte' =>
                'Tahun selesai tidak boleh sebelum tahun mulai.',
            'end_year.max' =>
                'Tahun selesai tidak boleh melebihi tahun ini.',
        ];
    }
}
