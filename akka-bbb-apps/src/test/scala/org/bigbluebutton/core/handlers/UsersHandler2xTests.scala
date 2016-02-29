package org.bigbluebutton.core.handlers

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.domain.{ CanEjectUser, CanRaiseHand, Permission2x }
import org.bigbluebutton.core.filters.DefaultPermissionsFilter

class UsersHandler2xTests extends UnitSpec {
  it should "eject user" in {
    object DefPerm extends DefaultPermissionsFilter
    val perm: Set[Permission2x] = Set(CanEjectUser, CanRaiseHand)

    assert(DefPerm.can(CanEjectUser, perm))
  }

  it should "not eject user" in {
    object DefPerm extends DefaultPermissionsFilter
    val perm: Set[Permission2x] = Set(CanRaiseHand)

    assert(DefPerm.can(CanEjectUser, perm) != true)
  }
}
