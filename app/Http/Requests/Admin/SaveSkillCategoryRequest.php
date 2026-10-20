<?php

namespace App\Http\Requests\Admin;

use App\Models\SkillCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveSkillCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $uniqueName = Rule::unique('skill_categories', 'name');
        $category = $this->route('skillCategory');

        if ($category instanceof SkillCategory) {
            $uniqueName->ignore($category);
        }

        return [
            'name' => ['required', 'string', 'max:120', $uniqueName],
            'description' => ['required', 'string'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:4294967295'],
        ];
    }
}
