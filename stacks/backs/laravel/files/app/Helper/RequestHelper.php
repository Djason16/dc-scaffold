<?php

namespace App\Helper;

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
}
