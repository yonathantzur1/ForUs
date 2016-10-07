interface MaterialDesign {
    /**
     * Shortcut to run all the following commands: ripples, input, checkbox, radio
     */
    init() : void;
    /**
     * Will apply ripples.js to the default elements.
     */
    ripples() : void;
    /**
     * Will apply ripples.js to specified selectors
     * @param selectors Comma separated selectors to apply
     */
    ripples(selectors : string) : void;
    /**
     * Will enable the MD style to the text inputs, and other kind of inputs (number, email, file etc).
     */
    input() : void;
    /**
     * Will enable the MD style to the text inputs matching selectors
     * @param selectors Comma separated selectors to apply
     */
    input(selectors : string) : void;
    /**
     * Will enable the MD style to the checkboxes
     */
    checkbox() : void;
    /**
     * Will enable the MD style to checkboxes matching selectors
     * @param selectors Comma separated selectors to apply
     */
    checkbox(selectors : string) : void;
    /**
     * Will enable the MD style to the checkboxes
     */
    radio() : void;
    /**
     * Will enable the MD style to checkboxes matching selectors
     * @param selectors Comma separated selectors to apply
     */
    radio(selectors : string) : void;
    
    options : MaterialDesignOptions;
}

interface MaterialDesignOptions {
    withRipples : string;
    inputElements : string;
    checkboxElements : string;
    radioElements : string;
}

interface JQueryStatic {
    material : MaterialDesign
}