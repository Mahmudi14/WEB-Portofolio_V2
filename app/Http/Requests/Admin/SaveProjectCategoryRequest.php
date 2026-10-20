<?php

namespace App\Http\Requests\Admin;

use App\Models\ProjectCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProjectCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $unique = Rule::unique(
            'project_categories',
            'name'
        );

        $category = $this->route('projectCategory');

        if ($category instanceof ProjectCategory) {
            $unique->ignore($category->id);
        }

        return [
            'name' => [
                'required',
                'string',
                'max:120',
                $unique,
            ],
            'sort_order' => [
                'required',
                'integer',
                'min:0',
                'max:4294967295',
            ],
        ];
    }
}
