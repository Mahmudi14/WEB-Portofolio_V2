<?php

namespace App\Http\Requests\Admin;

use App\Models\SkillCategory;
use App\Models\SkillItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveSkillItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        /** @var SkillCategory $category */
        $category = $this->route('skillCategory');

        $uniqueName = Rule::unique('skill_items', 'name')
            ->where('skill_category_id', $category->getKey());

        $item = $this->route('skillItem');

        if ($item instanceof SkillItem) {
            $uniqueName->ignore($item);
        }

        return [
            'name' => ['required', 'string', 'max:120', $uniqueName],
            'sort_order' => ['required', 'integer', 'min:0', 'max:4294967295'],
        ];
    }
}
