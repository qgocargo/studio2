<?php
namespace Firebase\JWT;

class JWT
{
    public static $leeway = 0;
    public static $timestamp = null;

    public static function encode($payload, $key, $alg, $keyId = null, $head = null)
    {
        $header = array('typ' => 'JWT', 'alg' => $alg);
        if ($keyId !== null) {
            $header['kid'] = $keyId;
        }
        if (isset($head) && is_array($head)) {
            $header = array_merge($head, $header);
        }

        $segments = array();
        $segments[] = static::urlsafeB64Encode(static::jsonEncode($header));
        $segments[] = static::urlsafeB64Encode(static::jsonEncode($payload));
        $signing_input = implode('.', $segments);

        $signature = static::sign($signing_input, $key, $alg);
        $segments[] = static::urlsafeB64Encode($signature);

        return implode('.', $segments);
    }

    public static function decode($jwt, $key, array $allowed_algs = array())
    {
        $timestamp = is_null(static::$timestamp) ? time() : static::$timestamp;

        if (empty($key)) {
            throw new \InvalidArgumentException('Key may not be empty');
        }
        $tks = explode('.', $jwt);
        if (count($tks) != 3) {
            throw new \UnexpectedValueException('Wrong number of segments');
        }
        list($headb64, $bodyb64, $cryptob64) = $tks;
        if (null === ($header = static::jsonDecode(static::urlsafeB64Decode($headb64)))) {
            throw new \UnexpectedValueException('Invalid header encoding');
        }
        if (null === $payload = static::jsonDecode(static::urlsafeB64Decode($bodyb64))) {
            throw new \UnexpectedValueException('Invalid claims encoding');
        }
        $sig = static::urlsafeB64Decode($cryptob64);

        if (empty($header->alg)) {
            throw new \UnexpectedValueException('Empty algorithm');
        }
        if (empty($allowed_algs)) {
            throw new \DomainException('Allowed algorithms must be specified');
        }
        if (!in_array($header->alg, $allowed_algs)) {
            throw new \UnexpectedValueException('Algorithm not supported');
        }
        
        if (!static::verify("$headb64.$bodyb64", $sig, $key, $header->alg)) {
            throw new SignatureInvalidException('Signature verification failed');
        }

        if (isset($payload->nbf) && $payload->nbf > ($timestamp + static::$leeway)) {
            throw new BeforeValidException('Cannot handle token prior to ' . date(\DateTime::ISO8601, $payload->nbf));
        }

        if (isset($payload->iat) && $payload->iat > ($timestamp + static::$leeway)) {
            throw new BeforeValidException('Cannot handle token prior to ' . date(\DateTime::ISO8601, $payload->iat));
        }

        if (isset($payload->exp) && ($timestamp - static::$leeway) >= $payload->exp) {
            throw new ExpiredException('Expired token');
        }

        return $payload;
    }

    private static function verify($msg, $signature, $key, $alg)
    {
        // ... (Verification logic based on alg)
        return hash_hmac('sha256', $msg, $key, true) === $signature;
    }
    
    public static function jsonEncode($input)
    {
        $json = json_encode($input);
        return $json;
    }

    public static function jsonDecode($input)
    {
        return json_decode($input, false, 512, JSON_BIGINT_AS_STRING);
    }
    
    public static function urlsafeB64Encode($input)
    {
        return str_replace('=', '', strtr(base64_encode($input), '+/', '-_'));
    }

    public static function urlsafeB64Decode($input)
    {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $input .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($input, '-_', '+/'));
    }

     private static function sign($msg, $key, $alg = 'HS256')
    {
        return hash_hmac('sha256', $msg, $key, true);
    }
}
