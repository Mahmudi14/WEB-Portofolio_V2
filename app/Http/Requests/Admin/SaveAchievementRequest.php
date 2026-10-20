<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveAchievementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'description' => $this->input('description') ?: null,
            'institution_name' =>
                $this->input('institution_name') ?: null,
        ]);
    }

    public function rules(): array
    {
        return [
            'category' => [
                'required',
                'string',
                Rule::in([
                    'prestasi',
                    'penghargaan',
                    'sertifikasi',
                    'lainnya',
                ]),
            ],

            'title' => [
                'required',
                'string',
                'max:200',
            ],

            'description' => [
                'nullable',
                'string',
                'max:10000',
            ],

            'year' => [
                'required',
                'integer',
                'between:1900,'.now()->year,
            ],

            'institution_name' => [
                'nullable',
                'string',
                'max:200',
            ],

            'sort_order' => [
                'required',
                'integer',
                'min:0',
                'max:4294967295',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'category.required' =>
                'Kategori pencapaian wajib dipilih.',

            'category.in' =>
                'Kategori pencapaian tidak valid.',

            'title.required' =>
                'Judul pencapaian wajib diisi.',

            'title.max' =>
                'Judul maksimal 200 karakter.',

            'year.required' =>
                'Tahun pencapaian wajib diisi.',

            'year.between' =>
                'Tahun pencapaian tidak valid.',

            'sort_order.required' =>
                'Urutan tampil wajib diisi.',
        ];
    }
}
