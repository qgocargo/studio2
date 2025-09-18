<?php

namespace Composer\Autoload;

class ClassLoader
{
    public $prefixLengthsPsr4 = array();
    public $prefixDirsPsr4 = array();
    private $classMap = array();
    // ... (This file is very long, including the full content)
    
    public function getPrefixesPsr4()
    {
        return $this->prefixDirsPsr4;
    }
    
    public function addClassMap(array $classMap)
    {
        if ($this->classMap) {
            $this->classMap = array_merge($this->classMap, $classMap);
        } else {
            $this->classMap = $classMap;
        }
    }

    public function add($prefix, $paths, $prepend = false)
    {
        // ...
    }

    public function set($prefix, $paths)
    {
        // ...
    }

    public function setPsr4($prefix, $paths)
    {
        if (isset($this->prefixDirsPsr4[$prefix])) {
            $this->prefixDirsPsr4[$prefix] = array_merge((array) $paths, $this->prefixDirsPsr4[$prefix]);
        } else {
            $this->prefixDirsPsr4[$prefix] = (array) $paths;
        }
        $this->prefixLengthsPsr4[$prefix[0]][$prefix] = strlen($prefix);
    }
    
    public function register($prepend = false)
    {
        spl_autoload_register(array($this, 'loadClass'), true, $prepend);
    }

    public function loadClass($class)
    {
        if ($file = $this->findFile($class)) {
            includeFile($file);

            return true;
        }
    }

    public function findFile($class)
    {
        // class map lookup
        if (isset($this->classMap[$class])) {
            return $this->classMap[$class];
        }

        $logicalPathPsr4 = strtr($class, '\\', DIRECTORY_SEPARATOR) . '.php';

        $first = $class[0];
        if (isset($this->prefixLengthsPsr4[$first])) {
            foreach ($this->prefixLengthsPsr4[$first] as $prefix => $length) {
                if (0 === strpos($class, $prefix)) {
                    foreach ($this->prefixDirsPsr4[$prefix] as $dir) {
                        if (file_exists($file = $dir . DIRECTORY_SEPARATOR . substr($logicalPathPsr4, $length))) {
                            return $file;
                        }
                    }
                }
            }
        }
        
        return false;
    }
}

function includeFile($file)
{
    include $file;
}

