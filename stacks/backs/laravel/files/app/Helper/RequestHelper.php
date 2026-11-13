<?php

namespace App\Helper;

use Illuminate\Http\Request;

/**
 * Same validation helper as the other back ends.
 */
class RequestHelper
{
    /**
     * Names of the required fields that are missing or empty.
     */
    public static function missing(array $data, array $requiredFields): array
    {
        return array_values(array_filter(
            $requiredFields,
            fn (string $field) => !isset($data[$field]) || $data[$field] === ''
        ));
    }

    /**
     * Form with files (multipart/form-data): the fields, and the files by field name.
     *   ['fields' => $fields, 'files' => $files] = RequestHelper::multipart($request)   // $files['photo']->store(...)
     */
    public static function multipart(Request $request): array
    {
        return ['fields' => $request->post(), 'files' => $request->allFiles()];
    }
}
