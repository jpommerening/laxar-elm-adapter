/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Implements the LaxarJS adapter API for the integration technology "elm":
 * https://github.com/LaxarJS/laxar/blob/master/docs/manuals/adapters.md
 *
 * @module laxar-elm-adapter
 */

export const technology = 'elm';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( {}, adapterServices ) {

   const { artifactProvider } = adapterServices;

   return {
      create
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function create( { widgetName, anchorElement, services, onBeforeControllerCreation } ) {

      const widget = services.axContext.widget;
      const provider = artifactProvider.forWidget( widgetName );

      return provideElm( provider )
         .then( Elm => {
            const Main = Elm.Main || Elm[ toCamelCase( widgetName ) ];
            let program;

            return {
               domAttachTo( areaElement, templateHtml ) {
                  if( templateHtml ) {
                     throw new Error( 'Template HTML not supported for Elm components' );
                  }
                  program = Main.embed( anchorElement );
                  provideWidgetServices( program, services, onBeforeControllerCreation );
                  areaElement.appendChild( anchorElement );
               },
               domDetach() {
                  const parent = anchorElement.parentNode;
                  if( parent ) {
                     parent.removeChild( anchorElement );
                  }
               },
               destroy() {
                  // TODO: clear subscriptions?
               }
            };
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function provideElm( provider ) {
      return provider.module();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function provideWidgetServices( program, services, onBeforeControllerCreation ) {
      const serviceNames = Object.keys( program.ports ).filter( name => name in services );
      const widgetServices = serviceNames.reduce( ( widgetServices, name ) => {
         widgetServices[ name ] = services[ name ];
         return widgetServices;
      }, {} );
      onBeforeControllerCreation( widgetServices );
      serviceNames.forEach( name => {
         program.ports[ name ].send( widgetServices[ name ] );
      } );
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function toCamelCase( string ) {
   return string.replace( /(^|-)([a-z])/g, (match, start, letter) => letter.toUpperCase() );
}
