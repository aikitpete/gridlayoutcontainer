$(function() {

  function allElementsFromPointIframe(x, y, offsetX, offsetY) {
    var element, elements = [];
    var old_visibility = [];
    while (true) {
      element = document.getElementById('editor-iframe').contentWindow.document.elementFromPoint(x - offsetX, y - offsetY);
      if (!element || element === document.getElementById('editor-iframe').contentWindow.document.documentElement) {
        break;
      }
      elements.push(element);
      old_visibility.push(element.style.visibility);
      element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
    }
    for (var k = 0; k < elements.length; k++) {
      elements[k].style.visibility = old_visibility[k];
    }
    elements.reverse();
    return elements;
  }

  // Create the iframe
  var iframe = $('<iframe id="editor-iframe" name="editor-iframe" src="" style="width:100%;overflow:visible;" scrolling="no" seamless="seamless">');
  iframe.appendTo('body');
  //Wrapper for cells inserted as new rows
  var wrapperRow = '<div class="ui-sortable-handle"><div class="sortable-row connectedSortable ui-sortable"></div></div>';
  //Wrapper for items inserted as new cells
  var wrapperCell = '<div class="sortable-cell ui-sortable-handle"></div>';
  // Parameters for sortable
  var sortableParameters = {
    connectWith: '.connectedSortable',
    placeholder: {
      element: function(currentItem) {
        return $('<div class="highlight"></div>')[0];
      },
      update: function(container, p) {
        return;
      },
    },
    start: function(event, ui) {
      //console.log("sortable start start", sender, ui);
      /*if (typeof sender != 'undefined') {
        if (sender.hasClass('items')) {
          receiver = $(this);
        }
        console.log("sortable start stop2", sender, receiver);
        return;
      }*/
      //console.log("sortable start stop1", sender);
      sender = $(this);
    },
    over: function(event, ui) {},
    stop: function(event, ui) {
      console.log("sortable stop start");
      item = $(ui.item);
      receiver = $(ui.item.parent());
      console.log("RECEIVER:", ui.item.parent());
      //Create wrapper around items passed as new cells
      /*if (item.hasClass('item')) {
        var tmp = $('<p contenteditable="true">ITEM</p>');
        item.replaceWith(tmp);
        item = tmp.wrap(wrapperCell).parent();
      }*/

      if (item.hasClass('item')) {
        item.replaceWith(element);
        item = element.wrap(wrapperCell).parent();
      }

      //Create wrapper around cells passed into new rows
      if (item.hasClass('sortable-cell') && receiver.hasClass('sortable-grid')) {
        console.log("Wrap new row");
        item.wrap(wrapperRow);
        item.parent().sortable(sortableParameters);
      }

      //Delete empty rows
      //console.log(sender.hasClass('sortable-row'), sender.children().length);
      if (sender.hasClass('sortable-row') && sender.children().length == 0) {
        //console.log("should delete",sender);
        sender.parent().remove();
      }

      console.log("sortable stop end");
    },
    //iframeFix: true,
    //iframeOffset: iframe.offset(),
    cancel: 'h1'
  }

  // Called after done loading the iframe
  iframe.on('load', function() {
    //console.log("body0",iframe.find('body'));
    //console.log("body1",iframe.contents().find('body'));
    //console.log("body2",$('body',iframe.contents()));
    //console.log("load start");

    var selected = $('');
    // Initialize draggable
    $('.items div').draggable({
      start: function(event, ui) {
        //console.log("draggable start start",ui);
        sender = $(event.target.parentElement);
        item = $(event.target);
        item.css("visibility", "hidden");
        draggable = $(ui.helper);
        //console.log('#' + item.attr('id').split('-')[0]);
        element = $('#' + item.attr('id').split('-')[0]).clone();
        //console.log(element);
        draggable.css("width", item.css("width")).css("height", item.css("height")).css("display", "block");
        //console.log("draggable start stop",ui.draggable);
      },
      drag: function(event, ui) {
        var el = $(allElementsFromPointIframe(event.clientX, event.clientY, iframe.offset().left, iframe.offset().top));
        var div = $(el).filter('div').not($(this));
        selected.css({
          'border': 'none'
        });
        selected = div.filter('.sortable-grid, .sortable-row, .sortable-cell').last();
        if (selected.hasClass('sortable-grid') && selected.children().length == 0) {
          console.log("grid");
          selected.html('<div id="highlight"></div>');
        }
        else if (selected.hasClass('sortable-cell')) {
          var iframeX = event.clientX - iframe.offset().left;
          var iframeY = event.clientY - iframe.offset().top;
          var elementX = iframeX - selected[0].offsetLeft;
          var elementY = iframeY - selected[0].offsetTop;
          var elementWidth = selected[0].offsetWidth;
          var elementHeight = selected[0].offsetHeight;
          if (elementX / elementWidth <= elementY / elementHeight) {
            if ((elementX / elementWidth) * (elementY / elementHeight) <= 0.25) {
              console.log('Left');
              selected.insertBefore('<div id="highlight"></div>');
            }
            else if ((elementX / elementWidth) * (elementY / elementHeight) > 0.25) {
              console.log('Bottom');

            }
          }
          if (elementX / elementWidth > elementY / elementHeight) {
            if ((elementX / elementWidth) * (elementY / elementHeight) <= 0.25) {
              console.log('Top');
            }
            else if ((elementX / elementWidth) * (elementY / elementHeight) > 0.25) {
              console.log('Right');
              selected.insertAfter('<div id="highlight"></div>');
            }
          }
        }
        selected.css({
          'border': 'dotted 1px grey'
        });
        console.dir(div);
      },
      stop: function(event, ui) {
        console.log("draggable stop start");
        selected.css({
          'border': 'none'
        });
        console.log(ui);
        item = $(ui.item);
        receiver = $(ui.item.parent());
        console.log("RECEIVER:", ui.item.parent());
        //Create wrapper around items passed as new cells
        /*if (item.hasClass('item')) {
          var tmp = $('<p contenteditable="true">ITEM</p>');
          item.replaceWith(tmp);
          item = tmp.wrap(wrapperCell).parent();
        }*/

        if (item.hasClass('item')) {
          item.replaceWith(element);
          item = element.wrap(wrapperCell).parent();
        }

        //Create wrapper around cells passed into new rows
        if (item.hasClass('sortable-cell') && receiver.hasClass('sortable-grid')) {
          console.log("Wrap new row");
          item.wrap(wrapperRow);
          //item.parent().sortable(sortableParameters);
        }

        //Delete empty rows
        //console.log(sender.hasClass('sortable-row'), sender.children().length);
        if (sender.hasClass('sortable-row') && sender.children().length == 0) {
          //console.log("should delete",sender);
          sender.parent().remove();
        }
        console.log(element);
        iframe.contents().find('#highlight').replaceWith(element);
        item = $(event.target);
        item.css("visibility", "visible");
        console.log("draggable stop end");
      },
      helper: 'clone',
      iframeFix: true,
      iframeOffset: iframe.offset(),
      zIndex: 9998,
      connectToSortable: iframe.contents().find('.sortable-grid, .sortable-row').sortable(sortableParameters), // Initialize sortable
    });
    //console.log(this);
    var self = this;
    var iframeWin = document.getElementById('editor-iframe').contentWindow;
    self.style.height = Math.max(iframeWin.document.body.scrollHeight, iframeWin.document.body.offsetHeight, iframeWin.document.documentElement.clientHeight, iframeWin.document.documentElement.scrollHeight, iframeWin.document.documentElement.offsetHeight) + 'px';
    //console.log("load:", this.style.height);
    var previousHeight;
    var newHeight;
    iframeWin.addEventListener('resize', function() {
      //this.style.height =
      //  this.contentWindow.document.body.offsetHeight + 'px';
      console.log("change start:", self.style.height);
      //console.log(self);
      var self = this;
      newHeight = Math.max(iframeWin.document.body.scrollHeight, iframeWin.document.body.offsetHeight, iframeWin.document.documentElement.clientHeight, iframeWin.document.documentElement.scrollHeight, iframeWin.document.documentElement.offsetHeight);
      if (previousHeight != newHeight) {
        self.style.height = newHeight + 'px';
        previousHeight = newHeight;
      }
      console.log("change end:", self.style.height);
    });
    /*iframe.contents().find('body').wrapInner('<div id="droppable" style="background-color:rgba(250,250,250,0.5);z-index:9999"></div>');

    var droppable = iframe.contents().find('#droppable');
    console.log(droppable);
    droppable.droppable({
      drop: function(event, ui) {
        $(this).html("Dropped!");
      }
    });*/
    $('#save-btn').click(function save() {
      console.log("Saving...");
      iframe.contents().find('body').html('');
    });

    $('#cleanup-btn').click(function cleanUp() {
      console.log("Cleaning up...");
      console.log(iframe);
      console.log(iframe.contents().find('body'));
      iframe.contents().find('body').empty();
    });
    //console.log("load end");
  });

  // Load content for iframe
  $("#editor-iframe").attr("src", "../../CMS/content/index.html");

  function focus() {
    $(this).focus();
  }

});