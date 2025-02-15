

export function registerItemHandlers(html,callerobj,caller){
      // Add Inventory Item
      html.find('.item-create').click(caller._onItemCreate.bind(this));

      // Update Inventory Item
      html.find('.item-edit').click(ev => {
        const li = $(ev.currentTarget).parents(".item");
        const item = callerobj.items.get(li.data("itemId"));
        item.sheet.render(true);
      });

          // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      callerobj.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });
}


export function registerEffectHandlers(html,callerobj){
    html.find('.effect-create').click(ev => {
        callerobj.createEmbeddedDocuments('ActiveEffect', [{
          label: 'Active Effect',
          icon: '/icons/svg/mystery-man.svg'
        }]);
      });
  
      html.find('.effect-edit').click(ev => {
        const li = $(ev.currentTarget).parents(".effect");
        const effect = callerobj.getEmbeddedDocument('ActiveEffect',li.data("itemId"));
        effect.sheet.render(true);
      });
  
      html.find('.effect-delete').click(ev => {
        const li = $(ev.currentTarget).parents(".effect");
        callerobj.deleteEmbeddedDocuments('ActiveEffect', [li.data("itemId")]);
      });
  
}



export async function _tempEffectCreation(callerobj, numberOfRuns, tempEffLabel, tempEffIcon, tempEffTar, tempEffMode, tempEffVal){
  for (let i = 0; numberOfRuns > i; i++){
    callerobj.createEmbeddedDocuments('ActiveEffect', [{
      label: tempEffLabel,
      icon: tempEffIcon,
      changes: [{key : tempEffTar, mode : tempEffMode, value : tempEffVal}]
    }]);
  }
}

export function registerCommonHandlers(html,callerobj){
    
    //Open/Close items (gear/weapons/flaws/traits etc.)

    html.find(".slideShow").click(ev => {
        const current = $(ev.currentTarget);
        const first = current.children().first();
        const last = current.children().last();
        const target = current.closest(".item").children().last();
        first.toggleClass("noShow");
        last.toggleClass("noShow");
        target.slideToggle(200);
    });
    
    // Custom Droplists (for pools)
    
    const dropdownBtns = html.find(".dropdown");
    const closeBtns = html.find(".closeButton");

    // Close the dropdown menu if the user clicks outside of it
    
    //This part needs further investigation as it triggers AFTER the button is clicked, leading to directly closing the just opened dropdown.
    /*document.addEventListener("click", function(event) {
      console.log("My event target matches .dropdown: ",event.target.matches(".dropdown"))
      console.log("this is because my event target is: ",event.target)
      if (!event.target.matches(".dropdown")) {
        console.log("Now I trigger closeAll")
        closeAllDropdowns();
      }
    });*/

    document.addEventListener("click", function(event) {
      if (event.target.matches(".droplistBackground") || event.target.matches(".droplistElement")) {
        closeAllDropdowns();
      }
    });

    closeBtns.click(ev => {
      closeAllDropdowns();
    });

    for (const btn of dropdownBtns) {
      btn.addEventListener("click", function() {
        const dropdownContainer = this.nextElementSibling;
        const open = dropdownContainer.style.display === "grid";
        closeAllDropdowns();
        if (!open) {
          dropdownContainer.style.display = "grid";
        }
      });
    }

    function closeAllDropdowns() {
      const dropdownContainers = document.querySelectorAll(".poolDroplist");
      for (const container of dropdownContainers) {
          container.style.display = "none";
      }
    }
    
  }

export function itemCreate(event,callerobj){
      event.preventDefault();
      const header = event.currentTarget;
      const type = header.dataset.type;
      const data = duplicate(header.dataset);
      const name = `New ${type.capitalize()}`;
      const itemData = {
        name: name,
        type: type,
        data: data
      };
      delete itemData.data["type"];
      if (itemData.type === "specialSkill" || itemData.type === "knowSkill") {
        itemData.name = "New Skill";
      }
      return callerobj.createEmbeddedDocuments("Item", [itemData]);
    }

export async function confirmation(popUpTitle, popUpHeadline, popUpCopy, popUpInfo, popUpTarget) {
  let cancelButton = game.i18n.localize('ep2e.roll.dialog.button.cancel');
  let deleteButton = game.i18n.localize('ep2e.actorSheet.button.delete');
  const dialogType = "confirmation"
  const template = "systems/eclipsephase/templates/chat/pop-up.html";
  const html = await renderTemplate(template, {popUpHeadline, popUpCopy, dialogType, popUpInfo, popUpTarget});

  return new Promise(resolve => {
      const data = {
          title: popUpTitle,
          content: html,
          buttons: {
              cancel: {
                label: cancelButton,
                callback: html => resolve ({confirm: false})
              },
              normal: {
                  label: deleteButton,
                  callback: html => resolve ({confirm: true})
              }
          },
          default: "normal",
          close: () => resolve ({cancelled: true})
      };
      let options = {width:250}
      new Dialog(data, options).render(true);
  });
}