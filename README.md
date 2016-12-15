# laxar-elm-loader

```elm
port module ElmDemoWidget exposing (main)

import Html exposing (Html, text, strong)

-- ports may be used to attach to widget services
port publish : String -> Cmd msg
port subscribe : (String -> msg) -> Sub msg

main : Html msg
main =
   strong [] [text "Hello world!"]
```
