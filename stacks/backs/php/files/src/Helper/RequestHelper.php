<?php

namespace App\Helper;

/**
 * Reads incoming data the same way in every controller.
 */
class RequestHelper
{
    /**
     * Request body as an array, whether the client sent JSON or form fields.
     */
    public static function body(): array
    {
        if ($_POST !== []) {
            return $_POST;
        }

        $decoded = json_decode(file_get_contents('php://input'), true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Query string value: /products?page=2 -> query('page') === '2'
     */
    public static function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

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
