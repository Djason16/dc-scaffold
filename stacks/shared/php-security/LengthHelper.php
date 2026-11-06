<?php

namespace App\Helper;

/**
 * Maximum length of the texts sent to the API: a text too long gets a clear 400 error instead of a 500 from MySQL.
 * Same lengths as the columns of the table (VARCHAR(100) => 100).
 *
 *   if ($error = LengthHelper::tooLong($data, ['name' => 100, 'email' => 100, 'message' => 5000])) {
 *       return ResponseHelper::validationError($response, $error);
 *   }
 */
class LengthHelper
{
    /** Error message for the first field longer than its maximum, null when every field fits. */
    public static function tooLong(array $data, array $max): ?string
    {
        foreach ($max as $field => $length) {
            if (is_string($data[$field] ?? null) && mb_strlen($data[$field]) > $length) {
                return "The $field is too long ($length characters at most).";
            }
        }

        return null;
    }
}
